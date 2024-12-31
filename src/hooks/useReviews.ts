import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Review } from '@/types/database';

interface UseReviewsOptions {
  companyId: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'rating' | 'likes';
  order?: 'asc' | 'desc';
}

export function useReviews(options: UseReviewsOptions) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('reviews').select('*').eq('company_id', options.companyId);

        // Apply sorting
        if (options.sortBy) {
          const column = options.sortBy === 'date' ? 'created_at' : options.sortBy;
          query = query.order(column, { ascending: options.order === 'asc' });
        }

        // Apply pagination
        if (options.limit) {
          query = query.limit(options.limit);
        }

        if (options.offset) {
          query = query.range(options.offset, (options.offset || 0) + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;

        setReviews(data as Review[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [options.companyId, options.limit, options.offset, options.sortBy, options.order]);

  return { reviews, loading, error };
}
