'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CompanyList } from '@/components/ui-library/CompanyList';
import { CompanyWithStats } from '@/types/types';
import { Database } from '@/types/supabase';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Database['public']['Tables']['companies']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*, reviews(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">All Companies</h1>
      <CompanyList companies={companies} />
    </div>
  );
}