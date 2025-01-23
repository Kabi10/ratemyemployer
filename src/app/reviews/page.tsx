'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

interface ReviewWithCompany {
  id: number;
  rating: number;
  title: string;
  content: string;
  pros: string | null;
  cons: string | null;
  status: string;
  position: string;
  employment_status: string;
  created_at: string;
  user_id: string;
  company: Pick<Company, 'id' | 'name'>;
}

function ReviewsList() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        console.log('Fetching reviews...');
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            title,
            content,
            pros,
            cons,
            position,
            employment_status,
            created_at,
            user_id,
            company:companies (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        console.log('Full query response:', { data, error });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          console.log('No data returned from Supabase');
          setError('No reviews found');
          return;
        }

        console.log('Number of reviews:', data.length);
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const handleWriteReview = () => {
    if (!user) {
      // Store the intended destination
      localStorage.setItem('redirectAfterAuth', '/reviews/new');
      router.push('/login');
      return;
    }
    router.push('/reviews/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recent Reviews</h1>
        <button
          onClick={handleWriteReview}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Write a Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No reviews available yet.</p>
            <p className="mt-2">
              <button
                onClick={handleWriteReview}
                className="text-blue-500 hover:text-blue-600"
              >
                Be the first to write a review!
              </button>
            </p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link
                    href={`/companies/${review.company?.id}`}
                    className="text-xl font-semibold hover:text-blue-500"
                  >
                    {review.company?.name}
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
          ))
        )}
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