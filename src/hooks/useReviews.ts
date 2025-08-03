import { useState, useEffect } from 'react';
import { getReviews } from '@/lib/database';
import type { 
  Review, 
  GetReviewsOptions, 
  DatabaseResult, 
  JoinedReview,
  CompanyId,
  UserId 
} from '@/types/database';

export type UseReviewsResult = {
  reviews: JoinedReview[] | null;
  loading: boolean;
  error: string | null;
  totalCount?: number;
};

export const useReviews = (options: GetReviewsOptions = {}): UseReviewsResult => {
  const [reviews, setReviews] = useState<JoinedReview[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Convert string IDs to proper types if provided
        const parsedOptions = {
          ...options,
          companyId: options.companyId ?
            (typeof options.companyId === 'string' ? parseInt(options.companyId, 10) : options.companyId) :
            undefined,
          userId: options.userId ?
            (typeof options.userId === 'string' ? parseInt(options.userId, 10) : options.userId) :
            undefined,
        };

        const result = await getReviews(parsedOptions);
        if (result.error) {
          setError(result.error.message || 'Failed to fetch reviews');
          setReviews(null);
        } else {
          setReviews(result.data ? result.data as JoinedReview[] : null);
          setTotalCount(result.data?.length || 0);
          setError(null);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setReviews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [
    options.page, 
    options.limit, 
    options.status, 
    options.companyId,
    options.userId,
    options.orderBy, 
    options.orderDirection,
    options.withCompany,
    options.withLikes
  ]);

  return { reviews, loading, error, totalCount };
};
