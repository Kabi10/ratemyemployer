import useSWR, { KeyedMutator } from 'swr';
import { createClient } from '@/lib/supabaseClient';
import { Company, Review } from '@/types';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

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
  error: any;
  mutate: KeyedMutator<CompanyWithDetails | null>;
}

const fetcher = async (key: string, id: string, options: UseCompanyOptions = {}): Promise<CompanyWithDetails | null> => {
  const supabase = createClient();
  const query = supabase.from('companies');

  if (options.withReviews) {
    const { data, error } = await query
      .select(`
        *,
        reviews (
          *,
          user_profiles:user_id (
            username,
            email
          )
        )
      `)
      .eq('id', id)
      .single() as PostgrestSingleResponse<CompanyWithDetails>;

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await query.select('*').eq('id', id).single() as PostgrestSingleResponse<Company>;
    if (error) throw error;

    if (options.withStats && data) {
      const { data: reviewStats, error: statsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('company_id', id);

      if (statsError) throw statsError;

      const totalReviews = reviewStats?.length || 0;
      const averageRating = totalReviews && reviewStats
        ? reviewStats.reduce((acc, review) => acc + review.rating, 0) / totalReviews
        : 0;

      return {
        ...data,
        stats: {
          totalReviews,
          averageRating,
        },
      };
    }

    return data;
  }
};

export function useCompany(id: string | null, options: UseCompanyOptions = {}): UseCompanyReturn {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['company', id, options] : null,
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
  withStats?: boolean;
  withReviews?: boolean;
}

interface UseCompaniesReturn {
  companies: CompanyWithDetails[];
  totalCount: number;
  isLoading: boolean;
  error: any;
  mutate: KeyedMutator<{ companies: CompanyWithDetails[]; count: number }>;
}

const companiesListFetcher = async (
  key: string,
  { limit = 10, offset = 0, searchQuery = '', industry = '', withStats = false, withReviews = false }: UseCompaniesOptions
): Promise<{ companies: CompanyWithDetails[]; count: number }> => {
  const supabase = createClient();
  const query = supabase.from('companies');

  // Apply filters
  let filtered = query.select(
    withReviews
      ? `
        *,
        reviews (
          *,
          user_profiles:user_id (
            username,
            email
          )
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
          .eq('company_id', company.id);

        const totalReviews = reviewStats?.length || 0;
        const averageRating = totalReviews && reviewStats
          ? reviewStats.reduce((acc, review) => acc + review.rating, 0) / totalReviews
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
