'use client';

import { StarIcon } from '@heroicons/react/20/solid';
import { useCompany } from '@/hooks/useCompany';
import { formatDateDisplay } from '@/utils/date';
import type { Review } from '@/types';

interface ReviewListProps {
  companyId: string | number;
}

function ReviewCard({ review }: { review: Review }) {
  const rating = review.rating ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {review.position || 'Position not specified'} • 
            {review.employment_status || 'Status not specified'}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateDisplay(review.created_at)}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{review.title || 'Untitled Review'}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content || 'No content provided'}</p>
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.pros && (
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Pros</h4>
              <p className="text-gray-600 dark:text-gray-400">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Cons</h4>
              <p className="text-gray-600 dark:text-gray-400">{review.cons}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReviewList({ companyId }: ReviewListProps) {
  const { company, isLoading, error } = useCompany(companyId, { withReviews: true });
  const reviews = company?.reviews ?? [];

  const keyExtractor = (review: Review): string => {
    return review.id?.toString() ?? `review-${Math.random()}`;
  };

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <ReviewCard key={keyExtractor(review)} review={review} />
      ))}
      {reviews.length === 0 && !isLoading && !error && (
        <p className="text-center text-gray-500">
          No reviews yet. Be the first to review this company!
        </p>
      )}
      {isLoading && (
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />
          ))}
        </div>
      )}
      {error && (
        <p className="text-center text-red-500">
          Error loading reviews. Please try again later.
        </p>
      )}
    </div>
  );
}
