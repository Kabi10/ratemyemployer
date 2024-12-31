'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import { CompanyCard } from '@/components/CompanyCard';
import { Company } from '@/types';

export function FeaturedCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('average_rating', { ascending: false })
          .limit(3);

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching featured companies:', err);
        setError('Failed to load featured companies');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedCompanies();
  }, []);

  if (error) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
        <div className="text-red-500 text-center">{error}</div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </section>
  );
}
