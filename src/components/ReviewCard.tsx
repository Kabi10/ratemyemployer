// components/ReviewCard.tsx
'use client';
import React from 'react';
import { Review } from '@/types';
import { ReviewActions } from './ReviewActions';

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{review.title}</h3>
          <p className="text-gray-600">{review.position}</p>
          <p className="text-sm text-gray-500">
            {review.employment_status} • {review.is_current_employee ? 'Current Employee' : 'Former Employee'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-2xl text-yellow-400">{'★'.repeat(review.rating)}</div>
          <div className="text-2xl text-gray-300">{'★'.repeat(5 - review.rating)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h4 className="font-medium">Review</h4>
          <p className="text-gray-700">{review.content}</p>
        </div>
        {review.pros && (
          <div>
            <h4 className="font-medium text-green-600">Pros</h4>
            <p className="text-gray-700">{review.pros}</p>
          </div>
        )}
        {review.cons && (
          <div>
            <h4 className="font-medium text-red-600">Cons</h4>
            <p className="text-gray-700">{review.cons}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-500">
          {new Date(review.created_at).toLocaleDateString()}
        </div>
        <ReviewActions reviewId={review.id.toString()} initialLikes={review.likes || 0} />
      </div>
    </div>
  );
}
