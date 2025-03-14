'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';

import { StarIcon } from '@heroicons/react/20/solid';

import { useCompany } from '@/hooks/useCompany';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ReviewCard } from '@/components/ReviewCard';

export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id;
  const { company, loading, error } = useCompany(id as string, { withReviews: true });
  const review = company?.reviews?.find(r => r.id?.toString() === id);

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

  if (!review) {
    return <ErrorDisplay message="Review not found" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Review for {company?.name}</h1>
          <ReviewCard review={review} />
        </div>
      </div>
    </div>
  );
}