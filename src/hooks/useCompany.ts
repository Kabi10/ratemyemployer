import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

interface UseCompaniesOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  industry?: string;
  location?: string;
}

export function useCompany(id: string | null) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchCompany() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company');
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [id]);

  return { company, loading, error };
}

export function useCompanies(options: UseCompaniesOptions = {}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { limit = 10, offset = 0, searchQuery = '', industry = '', location = '' } = options;

  useEffect(() => {
    async function fetchCompanies() {
      try {
        let query = supabase
          .from('companies')
          .select('*', { count: 'exact' });

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }
        if (industry) {
          query = query.eq('industry', industry);
        }
        if (location) {
          query = query.eq('location', location);
        }

        const { data, error, count } = await query
          .range(offset, offset + limit - 1)
          .order('name');

        if (error) throw error;
        setCompanies(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [limit, offset, searchQuery, industry, location]);

  return { companies, totalCount, loading, error };
}