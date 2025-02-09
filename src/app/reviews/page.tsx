'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingSpinner } from '@/components/ui-library/loading-spinner';
import { Database } from '@/types/supabase';
import { ReviewList } from '@/components/ReviewList';
import type { Review } from '@/types/database';
import type { ReviewWithCompany } from '@/types/types';

type Company = Database['public']['Tables']['companies']['Row'];

function ReviewsList() {
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        console.log('Fetching reviews...');
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            company:company_id (
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
        console.log('Fetched reviews:', data);
        setReviews(data as ReviewWithCompany[]);
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
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Company Reviews</h1>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No reviews available yet.</p>
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
                Posted on {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchReviews() {
      const { searchParams } = new URL(window.location.href);
      const companyId = searchParams.get('companyId');

      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (companyError) throw companyError;
        if (!companyData) throw new Error('Company not found');

        setCompany(companyData);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, company:companies!inner(*)')
          .eq('company.id', companyId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [router]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (reviews.length === 0) return <div>No reviews found.</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">All Reviews</h1>
      <ReviewList reviews={reviews} />
    </div>
  );
}