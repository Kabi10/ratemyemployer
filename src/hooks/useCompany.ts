import { useState, useEffect } from 'react';
import { getCompany, getCompanies } from '@/lib/database';
import type {
  Company,
  CompanyWithReviews,
  GetCompaniesOptions,
  DatabaseResult,
  CompanyId,
} from '@/types/database';
import { supabase } from '@/lib/supabaseClient';

export type UseCompanyOptions = {
  withReviews?: boolean;
  withStats?: boolean;
};

export type UseCompanyResult = {
  company: Company | null;
  loading: boolean;
  error: string | null;
};

export type UseCompaniesResult = {
  companies: Company[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

export const useCompany = (
  id: CompanyId | string | null,
  options: UseCompanyOptions = {}
): UseCompanyResult => {
  const [company, setCompany] = useState<Company | null>(null);
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
        const result = await getCompany(numericId);

        if (result.error) {
          setError(result.error.message || 'Failed to fetch company');
          setCompany(null);
        } else if (result.data) {
          setCompany(result.data);
          setError(null);
        } else {
          setError('Company not found');
          setCompany(null);
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

export const useCompanies = (
  options: GetCompaniesOptions = {}
): UseCompaniesResult => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await getCompanies();

        if (result.error) {
          setError(result.error.message || 'Failed to fetch companies');
          setCompanies([]);
        } else if (result.data) {
          setCompanies(result.data);
          setTotalCount(result.data.length);
          setError(null);
        } else {
          setError('No companies found');
          setCompanies([]);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [options]);

  return { companies, totalCount, loading, error };
};
