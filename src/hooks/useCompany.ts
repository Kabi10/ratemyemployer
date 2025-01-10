import { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';
import useSWR, { KeyedMutator } from 'swr';
import { createClient } from '@/lib/supabaseClient';
import { Company, Review } from '@/types';
import { Database } from '@/types/supabase';

interface UseCompanyOptions {
  withReviews?: boolean;
  withStats?: boolean;
}

interface CompanyWithDetails extends Company {
  reviews?: Review[];
  stats?: {
    totalReviews: number;
    averageRating: number;
  };
}

interface UseCompanyReturn {
  company: CompanyWithDetails | null;
  isLoading: boolean;
  error: PostgrestError | Error | null;
  mutate: KeyedMutator<CompanyWithDetails | null>;
}

interface UseCompaniesReturn {
  companies: CompanyWithDetails[];
  totalCount: number;
  isLoading: boolean;
  error: PostgrestError | Error | null;
  mutate: KeyedMutator<{ companies: CompanyWithDetails[]; count: number }>;
}

const fetcher = async (key: string, id: string | number, options: UseCompanyOptions = {}): Promise<CompanyWithDetails | null> => {
  const supabase = createClient();
  const query = supabase.from('companies');

  if (options.withReviews) {
    const { data, error } = await query
      .select(`
        *,
        reviews (*)
      `)
      .eq('id', id)
      .single() as PostgrestSingleResponse<Database['public']['Tables']['companies']['Row'] & {
        reviews: Database['public']['Tables']['reviews']['Row'][];
      }>;

    if (error) throw error;
    return data as unknown as CompanyWithDetails;
  } else {
    const { data, error } = await query
      .select('*')
      .eq('id', id)
      .single() as PostgrestSingleResponse<Database['public']['Tables']['companies']['Row']>;
    
    if (error) throw error;

    if (options.withStats && data) {
      const { data: reviewStats, error: statsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('company_id', id);

      if (statsError) throw statsError;

      const totalReviews = reviewStats?.length || 0;
      const averageRating = totalReviews && reviewStats
        ? reviewStats.reduce((acc, review) => acc + (review.rating ?? 0), 0) / totalReviews
        : 0;

      return {
        ...data,
        stats: {
          totalReviews,
          averageRating,
        },
      } as CompanyWithDetails;
    }

    return data as unknown as CompanyWithDetails;
  }
};

export function useCompany(id: string | number | null, options: UseCompanyOptions = {}): UseCompanyReturn {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['company', id.toString(), options] : null,
    ([_, companyId, opts]) => fetcher('company', companyId, opts),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    company: data || null,
    isLoading,
    error,
    mutate,
  };
}

// Hook for fetching multiple companies
interface UseCompaniesOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  industry?: string;
  location?: string;
  withStats?: boolean;
  withReviews?: boolean;
}

const companiesListFetcher = async (
  key: string,
  { limit = 10, offset = 0, searchQuery = '', industry = '', location = '', withStats = false, withReviews = false }: UseCompaniesOptions
): Promise<{ companies: CompanyWithDetails[]; count: number }> => {
  const supabase = createClient();
  const query = supabase.from('companies');

  // Apply filters
  let filtered = query.select(
    withReviews
      ? `
        *,
        reviews:reviews (
          *
        )
      `
      : '*',
    { count: 'exact' }
  );

  if (searchQuery) {
    filtered = filtered.ilike('name', `%${searchQuery}%`);
  }
  if (industry) {
    filtered = filtered.eq('industry', industry);
  }
  if (location) {
    filtered = filtered.eq('location', location);
  }

  // Apply pagination
  const { data, error, count } = await filtered.range(offset, offset + limit - 1).order('name');
  if (error) throw error;

  if (withStats && data) {
    // Fetch stats for all companies in parallel
    const companiesWithStats = await Promise.all(
      (data as unknown as Company[]).map(async (company) => {
        const { data: reviewStats } = await supabase
          .from('reviews')
          .select('rating')
          .eq('company_id', company.id || 0);

        const totalReviews = reviewStats?.length || 0;
        const averageRating = totalReviews && reviewStats
          ? reviewStats.reduce((acc, review) => acc + (review.rating ?? 0), 0) / totalReviews
          : 0;

        return {
          ...company,
          stats: {
            totalReviews,
            averageRating,
          },
        };
      })
    );

    return {
      companies: companiesWithStats,
      count: count || 0,
    };
  }

  return {
    companies: data as unknown as CompanyWithDetails[],
    count: count || 0,
  };
};

export function useCompanies(options: UseCompaniesOptions = {}): UseCompaniesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    ['companies', options],
    ([_, opts]) => companiesListFetcher('companies', opts),
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
