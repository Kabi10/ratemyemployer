import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import type { Review } from '@/types';

interface UseReviewsReturn {
  reviews: Review[] | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
}

export function useReviews(): UseReviewsReturn {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchReviews() {
    if (!user) {
      setReviews(null);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select(`
          *,
          company:companies (
            id,
            name,
            industry,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [user]);

  return {
    reviews,
    isLoading,
    error,
    mutate: fetchReviews
  };
} 