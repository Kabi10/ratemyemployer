'use client';

import { StarIcon } from '@heroicons/react/20/solid';
import { useCompany } from '@/hooks/useCompany';
import { List } from '@/components/ui/List';
import type { Review } from '@/types';

interface ReviewListProps {
  companyId: string;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {review.position} • {review.employment_status}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
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
  const reviews = company?.reviews || [];

  return (
    <List<Review>
      items={reviews}
      renderItem={(review) => <ReviewCard review={review} />}
      keyExtractor={(review) => review.id}
      isLoading={isLoading}
      error={error}
      emptyMessage="No reviews yet. Be the first to review this company!"
      loadingItemCount={3}
      gridCols={{ default: 1 }}
      className="space-y-6"
    />
  );
}
