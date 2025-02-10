'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      fetchUserReviews(user.id);
    };

    checkUser();
  }, [router]);

  const fetchUserReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, companies(*)')
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch your reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id); // Extra safety check

      if (error) throw error;

      setReviews(reviews.filter((review) => review.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't written any reviews yet.</p>
          <button
            onClick={() => router.push('/companies')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse Companies
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {review.companies?.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{review.position}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 font-semibold">
                    {review.rating}/5
                  </span>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900">{review.title}</h4>
                <div className="mt-2 space-y-4">
                  <div>
                    <h5 className="text-green-600 font-medium">Pros</h5>
                    <p className="text-gray-700">{review.pros}</p>
                  </div>
                  <div>
                    <h5 className="text-red-600 font-medium">Cons</h5>
                    <p className="text-gray-700">{review.cons}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Posted on {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
