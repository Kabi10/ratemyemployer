// components/ReviewCard.tsx
'use client';
import React from 'react';
import { Review } from '@/types/database';
import { ReviewActions } from './ReviewActions';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-2">{review.title}</h3>
      <p className="text-gray-600 mb-2">
        <strong>Position:</strong> {review.position}
      </p>
      <p className="text-gray-600 mb-2">
        <strong>Employment Status:</strong>{' '}
        {review.is_current_employee ? 'Current Employee' : 'Former Employee'}
      </p>
      <div className="mb-2">
        <p className="font-semibold">Pros:</p>
        <p className="text-gray-700">{review.pros}</p>
      </div>
      <div>
        <p className="font-semibold">Cons:</p>
        <p className="text-gray-700">{review.cons}</p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-gray-500 text-sm">
          <strong>Rating:</strong> {review.rating} / 5
        </p>
        <ReviewActions reviewId={review.id} initialLikes={review.likes || 0} />
      </div>
    </div>
  );
};

export default ReviewCard;
