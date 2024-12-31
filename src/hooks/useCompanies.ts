import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import { Company } from '@/types';

interface UseCompaniesOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  industry?: string;
}

const fetcher = async (
  key: string,
  { limit = 10, offset = 0, searchQuery = '', industry = '' }: UseCompaniesOptions
) => {
  let query = supabase.from('companies').select('*', { count: 'exact' });

  // Apply filters
  if (searchQuery) {
    query = query.ilike('name', `%${searchQuery}%`);
  }

  if (industry) {
    query = query.eq('industry', industry);
  }

  // Apply pagination
  const { data, error, count } = await query.range(offset, offset + limit - 1).order('name');

  if (error) throw error;

  return {
    companies: data || [],
    count: count || 0,
  };
};

export function useCompanies(options: UseCompaniesOptions = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['companies', options],
    ([_, opts]) => fetcher('companies', opts),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    companies: data?.companies || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
