'use client';

import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateDisplay } from '@/utils/date';
import { ReviewCard } from './ReviewCard';
import { List } from '@/components/ui-library/List';
import type { Review } from '@/types/database';

import { useCompany } from '@/hooks/useCompany';

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList = ({ reviews }: ReviewListProps) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold">{review.title}</h3>
          <div className="flex items-center mt-2">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="ml-1">{review.rating}</span>
          </div>
          <p className="mt-2 text-gray-600">{review.pros}</p>
          <p className="mt-2 text-gray-600">{review.cons}</p>
          {review.company && (
            <p className="mt-2 text-sm text-gray-500">
              Company: {review.company.name}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
