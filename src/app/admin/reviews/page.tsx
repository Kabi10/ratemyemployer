'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Review, Company } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface ReviewWithCompany extends Review {
  company: Company;
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          *,
          company:companies(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
      showToast('Review approved successfully', 'success');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      showToast('Failed to approve review', 'error');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{review.company.name}</h2>
                <div className="text-sm text-gray-600 mt-1">
                  {review.position} • {review.employment_status}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {review.status !== 'approved' && (
                  <button
                    onClick={() => handleApproveReview(review.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => router.push(`/reviews/${review.id}/edit`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="text-lg font-bold">{review.rating}/5</div>
              <span className="ml-2 text-sm text-gray-600">
                Posted on {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{review.title}</h3>
            <p className="text-gray-700 mb-4">{review.content}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-600 mb-1">Pros</h4>
                <p className="text-sm text-gray-600">{review.pros || 'None provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-1">Cons</h4>
                <p className="text-sm text-gray-600">{review.cons || 'None provided'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
