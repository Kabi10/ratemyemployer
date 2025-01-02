'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/Toast';
import { Review } from '@/types';

interface ReviewWithCompany extends Review {
  company: {
    id: string;
    name: string;
    industry: string;
  };
}

export default function ReviewDetailsPage() {
  const params = useParams();
  const _router = useRouter();
  const _showToast = useToast();
  const [review, setReview] = useState<ReviewWithCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const reviewId = params.id;
        if (typeof reviewId !== 'string') {
          throw new Error('Invalid review ID');
        }

        const { data, error } = await supabase
          .from('reviews')
          .select(
            `
            *,
            company:companies (
              id,
              name,
              industry
            )
          `
          )
          .eq('id', reviewId)
          .single();

        if (error) throw error;
        setReview(data);
      } catch (err) {
        console.error('Error fetching review:', err);
        setError('Failed to load review');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error || 'Review not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{review.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {review.company.name} • {review.company.industry}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{review.rating}/5</div>
            <div className="text-sm text-gray-500">
              Posted on {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-lg font-semibold mb-2">Position Details</div>
          <p className="text-gray-600 dark:text-gray-300">
            {review.position} • {review.employment_status}
          </p>
        </div>

        {review.content && (
          <div className="mb-6">
            <div className="text-lg font-semibold mb-2">Review</div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{review.content}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-lg font-semibold mb-2 text-green-600">Pros</div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {review.pros || 'None provided'}
            </p>
          </div>
          <div>
            <div className="text-lg font-semibold mb-2 text-red-600">Cons</div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {review.cons || 'None provided'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
