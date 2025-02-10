'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/lib/auth/withAuth';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { supabase } from '@/lib/supabaseClient';
import { formatDateDisplay } from '@/utils/date';

interface Review {
  id: number;
  title: string | null;
  content: string | null;
  rating: number | null;
  created_at: string | null;
  status: string | null;
  company: {
    id: number;
    name: string;
    industry: string | null;
    location: string | null;
  } | null;
}

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error: fetchError } = await supabase
          .from('reviews')
          .select(
            `
            *,
            company:companies (
              id,
              name,
              industry,
              location
            )
          `
          )
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setReviews(data as Review[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch reviews')
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const handleApproveReview = async (reviewId: number) => {
    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, status: 'approved' } : review
        )
      );
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-600">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Review Management</h1>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {review.company?.name || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {review.company?.industry || 'Industry not specified'} •
                      {review.company?.location || 'Location not specified'}
                    </p>
                  </div>
                  {review.status === 'pending' && (
                    <button
                      onClick={() => handleApproveReview(review.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-gray-700">
                    {review.content || 'No content provided'}
                  </p>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Rating:{' '}
                    <span className="font-medium">
                      {review.rating || 'Not rated'}
                    </span>
                  </div>
                  <div>Posted on {formatDateDisplay(review.created_at)}</div>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <p className="text-center text-gray-600">No reviews found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminReviewsPage);
