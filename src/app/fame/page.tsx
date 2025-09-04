"use client";

import { useState, useEffect } from 'react';
import { getTopRatedCompanies } from '@/lib/wallApi';
import { CompanyCard } from '@/components/CompanyCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  website?: string | null;
}

export default function WallOfFamePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopCompanies() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTopRatedCompanies(20);
        setCompanies(data || []);
      } catch (err: any) {
        console.error('Error fetching top companies:', err);
        setError(err.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    }

    fetchTopCompanies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wall of Fame</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Wall of Fame</h1>
        <ErrorDisplay 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wall of Fame</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Top-rated companies based on employee reviews
      </p>
      
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <div key={company.id} className="relative">
              <div className="absolute -top-2 -left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <CompanyCard company={company as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
