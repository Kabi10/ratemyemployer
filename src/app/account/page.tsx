'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import { formatDateDisplay } from '@/utils/date';

type ReviewWithCompany = Database['public']['Tables']['reviews']['Row'] & {
  company: Database['public']['Tables']['companies']['Row'] | null;
};

export default function AccountPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('reviews')
          .select('*, company:companies(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <p className="text-center text-gray-600 dark:text-gray-400">Please log in to view your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Account</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Profile Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateDisplay(user.created_at)}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Reviews</h2>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 dark:text-red-400">{error}</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {review.company?.name || 'Unknown Company'}
                        </h3>
                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-1">
                          {review.title || 'Untitled Review'}
                        </h4>
                      </div>
                      <div className="text-yellow-400">{'★'.repeat(review.rating || 0)}</div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{review.content}</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Posted on {formatDateDisplay(review.created_at || '')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">You haven't written any reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
