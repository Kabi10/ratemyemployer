import { useState, useEffect } from 'react';
import { getReviews } from '@/lib/database';
import type {
  Review,
  GetReviewsOptions,
  DatabaseResult,
  CompanyId,
  UserId,
} from '@/types/database';

export type UseReviewsResult = {
  reviews: Review[] | null;
  loading: boolean;
  error: string | null;
  totalCount?: number;
};

export const useReviews = (
  options: GetReviewsOptions = {}
): UseReviewsResult => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Convert string IDs to proper types if provided
        const parsedOptions = {
          ...options,
          companyId: options.companyId
            ? typeof options.companyId === 'string'
              ? parseInt(options.companyId, 10)
              : options.companyId
            : undefined,
        };

        const result = await getReviews(parsedOptions.companyId);
        if (result.error) {
          setError(result.error.message || 'Failed to fetch reviews');
          setReviews(null);
        } else if (result.data) {
          setReviews(result.data);
          setTotalCount(result.data.length);
          setError(null);
        } else {
          setError('No reviews found');
          setReviews(null);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setReviews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [options]);

  return { reviews, loading, error, totalCount };
};
