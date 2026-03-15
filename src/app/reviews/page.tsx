import { Suspense } from 'react';
import { EnhancedReviewListContainer } from '@/components/EnhancedReviewListContainer';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getReviews } from '@/lib/database';

<<<<<<< HEAD
export const metadata: Metadata = {
  title: 'All Reviews | RateMyEmployer',
  description: 'Browse all employer reviews from RateMyEmployer, filtered and sorted to find exactly what you need.',
};
=======
// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Database } from '@/types/supabase';
>>>>>>> feature/remove-mcp-demo-pages

export default async function ReviewsPage() {
  // Server-side initial data fetch for SEO and initial render
  const initialReviewsResult = await getReviews({
    limit: 5,
    status: 'approved',
    page: 1
  });

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse honest reviews from employees across thousands of companies. Use the filters to find
          exactly what you're looking for.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                See what employees are saying about their workplaces
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Suspense fallback={<ReviewsLoading />}>
                <EnhancedReviewListContainer initialReviews={initialReviewsResult.data || []} initialCount={initialReviewsResult.count || 0} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ReviewsSidebar />
        </div>
      </div>
    </main>
  );
}

function ReviewsLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-800 animate-pulse h-40 rounded-lg"
        />
      ))}
    </div>
  );
}

function ReviewsSidebar() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            <li>Help others make informed decisions</li>
            <li>Share your workplace experience</li>
            <li>Highlight company strengths and weaknesses</li>
            <li>Improve transparency in the job market</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            <li>Be honest and specific</li>
            <li>Focus on your personal experience</li>
            <li>Avoid naming specific individuals</li>
            <li>No offensive or discriminatory content</li>
            <li>Respect confidentiality agreements</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Reviews Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Your reviews help create transparency in the workplace and empower job seekers to make informed decisions. 
            Together, we can improve workplace cultures across industries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}