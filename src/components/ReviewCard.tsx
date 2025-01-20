'use client'

import { Review } from '@/types';

import React from 'react';

import { formatDateDisplay } from '@/utils/date';


import { ReviewActions } from './ReviewActions';

// components/ReviewCard.tsx




function getRatingStars(rating: number | null): { filled: number; empty: number } {
  const validRating = Math.max(0, Math.min(rating || 0, 5));
  return {
    filled: validRating,
    empty: 5 - validRating
  };
}

export function ReviewCard({ review }: { review: Review }) {
  const stars = getRatingStars(review.rating);
  const reviewId = review.id?.toString() || '0';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{review.title || 'Untitled Review'}</h3>
          <p className="text-gray-600">{review.position || 'Position not specified'}</p>
          <p className="text-sm text-gray-500">
            {review.employment_status || 'Employment status not specified'} • 
            {review.is_current_employee ? 'Current Employee' : 'Former Employee'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl text-yellow-400">{'★'.repeat(stars.filled)}</div>
          <div className="text-2xl text-gray-300">{'★'.repeat(stars.empty)}</div>
        </div>
      </div>

      <div>
        <p className="text-gray-700 whitespace-pre-wrap">{review.content || 'No content provided'}</p>
      </div>

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {review.pros && (
            <div>
              <h4 className="font-medium text-green-600 mb-2">Pros</h4>
              <p className="text-gray-600">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">Cons</h4>
              <p className="text-gray-600">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          {formatDateDisplay(review.created_at)}
        </div>
        <ReviewActions reviewId={parseInt(reviewId)} initialLikes={review.likes || 0} />
      </div>
    </div>
  );
}