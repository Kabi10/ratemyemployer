"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  created_at: string;
}

export default function RisingStartupsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchRisingStartups() {
      try {
        setLoading(true);
        setError(null);
        
        // Get companies created in last 2 years with good ratings
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .gte('created_at', twoYearsAgo.toISOString())
          .gte('average_rating', 3.5)
          .gte('total_reviews', 2)
          .order('average_rating', { ascending: false })
          .order('total_reviews', { ascending: false })
          .limit(20);

        if (error) throw error;
        setCompanies(data || []);
      } catch (err: any) {
        console.error('Error fetching rising startups:', err);
        setError(err.message || 'Failed to load rising startups');
      } finally {
        setLoading(false);
      }
    }

    fetchRisingStartups();
  }, [supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Rising Startups</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Rising Startups</h1>
        <ErrorDisplay 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rising Startups</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Promising companies founded in the last 2 years with excellent ratings
      </p>
      
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No rising startups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company as any} />
          ))}
        </div>
      )}
    </div>
  );
}
