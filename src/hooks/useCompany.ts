import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

interface UseCompaniesOptions {
  limit?: number;
  offset?: number;
  searchQuery?: string;
  industry?: string;
  location?: string;
  orderBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

export function useCompany(id: string | null) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchCompany() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select(`
            *,
            reviews:reviews(rating)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Calculate average rating if there are reviews
        if (data && data.reviews && data.reviews.length > 0) {
          const avgRating = data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length;
          data.rating = Number(avgRating.toFixed(1));
        } else {
          data.rating = 0;
        }
        
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
  const supabase = createClient();

  const { 
    limit = 10, 
    offset = 0, 
    searchQuery = '', 
    industry = '', 
    location = '',
    orderBy = { column: 'name', direction: 'asc' }
  } = options;

  useEffect(() => {
    async function fetchCompanies() {
      try {
        let query = supabase
          .from('companies')
          .select(`
            *,
            reviews:reviews(rating),
            review_count:reviews(count)
          `, { count: 'exact' });

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
          .range(offset, offset + limit - 1);

        if (error) throw error;

        // Calculate average rating for each company
        const companiesWithRatings = data?.map(company => {
          if (company.reviews && company.reviews.length > 0) {
            const avgRating = company.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / company.reviews.length;
            return {
              ...company,
              rating: Number(avgRating.toFixed(1)),
              review_count: company.reviews.length
            };
          }
          return {
            ...company,
            rating: 0,
            review_count: 0
          };
        }) || [];

        // Sort companies based on the orderBy parameter
        const sortedCompanies = companiesWithRatings.sort((a, b) => {
          const aValue = a[orderBy.column];
          const bValue = b[orderBy.column];
          
          if (orderBy.direction === 'desc') {
            return bValue - aValue;
          }
          return aValue - bValue;
        });

        setCompanies(sortedCompanies);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [limit, offset, searchQuery, industry, location, orderBy]);

  return { companies, totalCount, loading, error };
}