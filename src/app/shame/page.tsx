'use client'


import { Database } from '@/types/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { CompanyNews } from '@/components/CompanyNews';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type Company = Database['public']['Tables']['companies']['Row'];

interface ShameCompany extends Company {
  total_violations: number;
  recent_violations: string[];
  shame_score: number;
  reviews: {
    rating: number | null;
    content: string | null;
    status: string | null;
  }[];
}

export default function WallOfShame() {
  const [companies, setCompanies] = useState<ShameCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShameList() {
      try {
        const supabase = createClient();
        
        // Get all companies with their reviews, removed the approved filter
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select(`
            *,
            reviews (
              rating,
              content,
              status,
              created_at
            )
          `)
          .order('average_rating', { ascending: true })
          .limit(10);

        if (companiesError) throw companiesError;

        // Transform and calculate shame metrics
        const shameCompanies = companiesData?.map(company => {
          const reviews = company.reviews || [];
          // Include all reviews with ratings
          const validReviews = reviews.filter((r: { rating: number | null }) => r.rating !== null);
          
          // Calculate shame score based on all reviews
          const avgRating = validReviews.length > 0
            ? validReviews.reduce((acc: number, r: { rating: number | null }) => acc + (r.rating || 0), 0) / validReviews.length
            : 5;

          // Get recent violations (negative reviews), including all statuses
          const violations = validReviews
            .filter((r: { rating: number | null, content: string | null }) => (r.rating || 0) <= 2 && r.content)
            .sort((a: { created_at: string | null }, b: { created_at: string | null }) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 3);

          return {
            ...company,
            total_violations: violations.length,
            recent_violations: violations.map((v: { content: string | null }) => v.content || ''),
            shame_score: calculateShameScore(avgRating, violations.length),
            reviews: validReviews
          };
        }) || [];

        // Sort by shame score (highest first)
        shameCompanies.sort((a, b) => b.shame_score - a.shame_score);
        
        setCompanies(shameCompanies);
      } catch (err) {
        console.error('Error fetching shame list:', err);
        setError(err instanceof Error ? `${err.name}: ${err.message}` : 'Failed to load Wall of Shame');
      } finally {
        setLoading(false);
      }
    }

    fetchShameList();
  }, []);

  function calculateShameScore(avgRating: number, violationCount: number): number {
    // Base score from rating (1-5 scale inverted to 0-4 scale)
    const ratingScore = (5 - avgRating) * 20; // Convert to 0-100 scale
    
    // Violation multiplier (each violation adds 10% up to 100% extra)
    const violationMultiplier = Math.min(violationCount * 0.1, 1);
    
    // Final score combines base rating with violation bonus
    const finalScore = ratingScore * (1 + violationMultiplier);
    
    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading shame list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Wall of Shame</h1>
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-red-700">Error: {error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Wall of Shame</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <Link 
                    href={`/companies/${company.id}`}
                    className="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {company.name}
                  </Link>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Shame Score:</span>
                      <span className="text-red-600">{company.shame_score.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Total Violations:</span>
                      <span>{company.total_violations}</span>
                    </div>
                    
                    {company.recent_violations.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Recent Violations:</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {company.recent_violations.slice(0, 3).map((violation, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                              {violation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-4">Recent News</h3>
                  <CompanyNews companyName={company.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}