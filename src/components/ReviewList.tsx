'use client'

import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateDisplay } from '@/utils/date';
import { ReviewCard } from './ReviewCard';
import { List } from './ui/List';
import type { Review } from '@/types/database';

import { useCompany } from '@/hooks/useCompany';

interface ReviewListProps {
  reviews?: Review[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  companyId: string;
}

export const ReviewList = ({
  reviews = [],
  loading = false,
  error = null,
  emptyMessage = 'No reviews found',
  companyId
}: ReviewListProps) => {
  const { session } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 animate-pulse h-32 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-4">
        {error.message || 'An error occurred while loading reviews'}
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center p-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h3>Reviews</h3>
      {showReviewForm && (
        <ReviewForm 
          companyId={companyId}
          onClose={() => setShowReviewForm(false)}
        />
      )}
      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};