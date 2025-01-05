'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ReviewForm } from '@/components/ReviewForm';
import { Review } from '@/types';

export default function EditReview() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    if (!params.id) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setReview(data);
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Failed to load review');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error || 'Review not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Review</h1>
      <ReviewForm
        companyId={review.company_id}
        initialData={review}
        onSuccess={() => {
          router.push('/account');
        }}
      />
    </div>
  );
}
