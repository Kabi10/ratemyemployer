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
          .eq('id', numericId);
        
        if (error) {
          setError(error.message || 'Failed to fetch company');
          setCompany(null);
        } else {
          setCompany(data[0] as JoinedCompany);
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
        const { data, error } = await supabase
          .from('companies')
          .select('*, reviews(*)');
        if (error) {
          setError(error.message || 'Failed to fetch companies');
          setCompanies([]);
        } else {
          setCompanies(data as JoinedCompany[]);
          setTotalCount(data.length);
          setError(null);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [
    options.page, 
    options.limit, 
    options.industry, 
    options.location, 
    options.search, 
    options.orderBy, 
    options.orderDirection,
    options.withReviews,
    options.withStats
  ]);

  return { companies, totalCount, loading, error };
};