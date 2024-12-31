'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';
import { Database } from '@/types/supabase';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type Review = Database['public']['Tables']['reviews']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];

interface ReviewWithCompany extends Omit<Review, 'company_id'> {
  company: Pick<Company, 'id' | 'name'>;
}

function ReviewsList() {
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(
            `
                        id,
                        rating,
                        title,
                        content,
                        pros,
                        cons,
                        status,
                        position,
                        employment_status,
                        created_at,
                        updated_at,
                        user_id,
                        company:companies (
                            id,
                            name
                        )
                    `
          )
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recent Reviews</h1>
        <Link
          href="/reviews/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Write a Review
        </Link>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link
                  href={`/companies/${review.company.id}`}
                  className="text-xl font-semibold hover:text-blue-500"
                >
                  {review.company.name}
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {review.position} • {review.employment_status}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold">{review.rating}/5</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{review.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Pros</h4>
                <p className="text-gray-600 dark:text-gray-400">{review.pros || 'None provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Cons</h4>
                <p className="text-gray-600 dark:text-gray-400">{review.cons || 'None provided'}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Posted on {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ErrorBoundary>
      <ReviewsList />
    </ErrorBoundary>
  );
}
