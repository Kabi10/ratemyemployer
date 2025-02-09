import { useState, useEffect } from 'react';
import { getCompany, getCompanies } from '@/lib/database';
import type { 
  Company, 
  CompanyWithReviews, 
  GetCompaniesOptions, 
  DatabaseResult, 
  JoinedCompany,
  CompanyId 
} from '@/types/database';
import { supabase } from '@/lib/supabaseClient';

export type UseCompanyOptions = {
  withReviews?: boolean;
  withStats?: boolean;
};

export type UseCompanyResult = {
  company: JoinedCompany | null;
  loading: boolean;
  error: string | null;
};

export type UseCompaniesResult = {
  companies: JoinedCompany[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

export const useCompany = (
  id: CompanyId | string | null,
  options: UseCompanyOptions = {}
): UseCompanyResult => {
  const [company, setCompany] = useState<JoinedCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const { data, error } = await supabase
          .from('companies')
          .select('*, reviews(*)')
          .eq('id', numericId)
          .single();
        
        if (error) {
          setError(error.message || 'Failed to fetch company');
          setCompany(null);
        } else {
          const validReviews = data.reviews?.filter(isReview) || [];
          setCompany({ ...data, reviews: validReviews });
          setError(null);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, options.withReviews, options.withStats]);

  return { company, loading, error };
};

export const useCompanies = (options: GetCompaniesOptions = {}): UseCompaniesResult => {
  const [companies, setCompanies] = useState<JoinedCompany[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('companies')
          .select('*', { count: 'exact' });

        // Add filters
        if (options.search) {
          query = query.ilike('name', `%${options.search}%`);
        }
        if (options.industry) {
          query = query.eq('industry', options.industry);
        }
        if (options.location) {
          query = query.eq('location', options.location);
        }

        // Add pagination
        const offset = ((options.page || 1) - 1) * (options.limit || ITEMS_PER_PAGE);
        query = query.range(offset, offset + (options.limit || ITEMS_PER_PAGE) - 1);

        // Add sorting
        if (options.orderBy) {
          query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
        }

        const { data, error, count } = await query;

        if (error) {
          setError(error.message);
          setCompanies([]);
          setTotalCount(0);
        } else {
          setCompanies(data as JoinedCompany[]);
          setTotalCount(count || 0);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load companies');
        setCompanies([]);
        setTotalCount(0);
      } finally {
        setLoading(false); // Ensure loading is always set to false
      }
    };

    fetchCompanies();
  }, [options.page, options.limit, options.industry, options.location, options.search, options.orderBy, options.orderDirection]);

  return { companies, totalCount, loading, error };
};