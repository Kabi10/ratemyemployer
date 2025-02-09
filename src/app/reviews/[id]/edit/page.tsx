'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { withAuth } from '@/lib/auth/withAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReviewForm } from '@/components/ReviewForm';
import type { Database } from '@/types/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];

export default function EditReview() {
  const params = useParams() as { id: string };
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return <div>Invalid review ID</div>;
  }

  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    if (!params?.id) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', params?.id)
        .single();

      if (error) throw error;
      setReview({
        id: data.id,
        company_id: data.company_id,
        title: data.title || '',
        content: data.content || '',
        rating: (data.rating !== null && data.rating !== undefined) ? data.rating : 0,
        pros: data.pros || '',
        cons: data.cons || '',
        employment_status: data.employment_status || 'Full-time',
        position: data.position || '',
        is_current_employee: data.is_current_employee || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        reviewer_name: data.reviewer_name || '',
        reviewer_email: data.reviewer_email || '',
        user_id: data.user_id || '',
      });
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Failed to load review');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

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
        companyId={review.company_id || 0}
        initialData={{
          title: review.title || '',
          rating: review.rating || 0,
          pros: review.pros || '',
          cons: review.cons || '',
          position: review.position || '',
          employment_status: (review.employment_status as "Full-time" | "Part-time" | "Contract" | "Intern") || undefined,
          is_current_employee: review.is_current_employee || false,
          reviewer_email: review.reviewer_email || '',
          reviewer_name: review.reviewer_name || '',
        }}
        onSuccess={() => {
          router.push('/account');
        }}
      />
    </div>
  );
}