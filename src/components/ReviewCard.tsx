'use client';

import { JoinedReview } from '@/types/database';
import React from 'react';
import { formatDateDisplay } from '@/utils/date';
import { ReviewActions } from './ReviewActions';

function getRatingStars(rating: number | null): {
  filled: number;
  empty: number;
} {
  const validRating = Math.max(0, Math.min(rating || 0, 5));
  return {
    filled: validRating,
    empty: 5 - validRating,
  };
}

interface ReviewCardProps {
  review: JoinedReview;
  showActions?: boolean;
  onLike?: (reviewId: number) => void;
  onReport?: (reviewId: number) => void;
  onEdit?: (reviewId: number) => void;
}

export function ReviewCard({ review, showActions = true }: ReviewCardProps) {
  const stars = getRatingStars(review.rating);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {review.title || 'Untitled Review'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {review.position || 'Position not specified'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {review.employment_status || 'Employment status not specified'} •
            {review.is_current_employee
              ? 'Current Employee'
              : 'Former Employee'}
          </p>
          {review.company && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              at {review.company.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl text-yellow-400">
            {'★'.repeat(stars.filled)}
          </div>
          <div className="text-2xl text-gray-300 dark:text-gray-600">
            {'★'.repeat(stars.empty)}
          </div>
        </div>
      </div>

      <div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {review.content || 'No content provided'}
        </p>
      </div>

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.pros && (
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                Pros
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                Cons
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateDisplay(review.created_at)}
          {review.reviewer_name && (
            <span className="ml-2">by {review.reviewer_name}</span>
          )}
        </div>
        {showActions && (
          <ReviewActions
            reviewId={review.id}
            initialLikes={review.likes_count || 0}
            isLiked={review.is_liked || false}
          />
        )}
      </div>
    </div>
  );
}

const isReviewWithCompany = (review: JoinedReview): review is JoinedReview => {
  return !!(review as JoinedReview).company;
};
