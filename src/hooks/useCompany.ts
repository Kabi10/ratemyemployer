import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import { Company } from '@/types';

const fetcher = async (key: string, id: string) => {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
};

export function useCompany(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['company', id] : null,
    ([_, companyId]) => fetcher('company', companyId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    company: data,
    isLoading,
    error,
    mutate,
  };
}
