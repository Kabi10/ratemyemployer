'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Company } from '@/types';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
          const validReviews = reviews.filter(r => r.rating !== null);
          
          // Calculate shame score based on all reviews
          const avgRating = validReviews.length > 0
            ? validReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / validReviews.length
            : 5;

          // Get recent violations (negative reviews), including all statuses
          const violations = validReviews
            .filter(r => (r.rating || 0) <= 2 && r.content) // Only reviews with rating ≤ 2
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })
            .map(r => r.content)
            .filter((content): content is string => !!content);

          return {
            ...company,
            total_violations: violations.length,
            recent_violations: violations,
            shame_score: calculateShameScore(avgRating, violations.length),
            reviews: validReviews
          };
        }) || [];

        // Sort by shame score (highest first)
        shameCompanies.sort((a, b) => b.shame_score - a.shame_score);
        
        setCompanies(shameCompanies);
      } catch (err) {
        console.error('Error fetching shame list:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Wall of Shame');
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
      <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg sm:text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 sm:mb-4 text-red-500 text-center">WALL OF SHAME</h1>
        <div className="w-16 sm:w-24 h-1 bg-red-500 mx-auto mb-6 sm:mb-8"></div>
        <p className="mb-6 sm:mb-8 text-gray-300 text-center max-w-2xl mx-auto text-sm sm:text-base px-4">
          Exposing companies with documented patterns of employee mistreatment, labor violations, 
          and unethical workplace practices. Together we can hold them accountable.
        </p>

        {companies.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-lg sm:text-xl text-gray-400">No companies found with negative reviews.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-8">
            {companies.map((company) => (
              <div 
                key={company.id}
                className="bg-gradient-to-r from-gray-900 to-red-900 p-4 sm:p-6 rounded-lg shadow-xl 
                         border-l-4 border-red-500 hover:shadow-2xl transition-all hover:scale-[1.01] 
                         active:scale-[0.99] group touch-manipulation"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
                  <div>
                    <Link 
                      href={`/companies/${company.id}`}
                      className="text-xl sm:text-2xl font-bold text-red-400 hover:text-red-300 
                               transition-colors group-hover:underline line-clamp-2"
                    >
                      {company.name}
                    </Link>
                    <p className="text-gray-400 text-sm sm:text-base mt-1">{company.industry}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                    <div className="text-2xl sm:text-3xl font-black text-red-500">
                      {company.shame_score}
                    </div>
                    <div className="text-xs sm:text-sm text-red-400">
                      Shame Score™
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 sm:mt-1">
                      {company.total_violations} violations
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {company.recent_violations.slice(0, 2).map((violation, index) => (
                    <p key={index} className="text-gray-300 bg-black bg-opacity-50 p-3 sm:p-4 
                                          rounded-lg italic text-sm sm:text-base">
                      "{violation}"
                    </p>
                  ))}
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs sm:text-sm text-gray-400">
                    Location: {company.location || 'Unknown'}
                  </div>
                  <Link
                    href={`/companies/${company.id}`}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white 
                             rounded-lg transition-colors text-center text-sm sm:text-base"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-black bg-opacity-50 rounded-lg border border-red-900">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-red-400">About the Shame Score™</h2>
          <p className="text-gray-300 text-sm sm:text-base">
            The Shame Score™ is calculated using a proprietary algorithm that considers:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-300 space-y-1 text-sm sm:text-base">
            <li>Severity and frequency of reported violations</li>
            <li>Employee ratings and feedback</li>
            <li>Documented incidents and patterns</li>
            <li>Company response and accountability</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 