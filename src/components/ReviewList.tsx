'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { StarIcon } from '@heroicons/react/20/solid';
import { Review } from '@/types';

interface ReviewListProps {
  companyId: string;
}

export function ReviewList({ companyId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [companyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map(review => (
        <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">{review.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {review.position} • {review.employment_status}
              </p>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Pros</h4>
              <p className="text-gray-700 dark:text-gray-300">{review.pros}</p>
            </div>
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Cons</h4>
              <p className="text-gray-700 dark:text-gray-300">{review.cons}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Review Details</h4>
            <p className="text-gray-700 dark:text-gray-300">{review.content}</p>
          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Posted on {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
