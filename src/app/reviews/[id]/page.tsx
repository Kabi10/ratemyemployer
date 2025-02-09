'use client'

import { useParams } from 'next/navigation';
import Link from 'next/link';

import { StarIcon } from '@heroicons/react/20/solid';

import { useCompany } from '@/hooks/useCompany';
import type { Review } from '@/types';

import { LoadingSpinner } from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  const params = useParams();
  const id = params?.id;
  const { company, loading, error } = useCompany(id as string, { withReviews: true });
  const review = company?.reviews?.find(r => r.id?.toString() === id) as Review | undefined;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">Review not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <Link
            href={`/companies/${review.company_id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {company?.name}
          </Link>
          {review.created_at && (
            <span className="text-gray-600 dark:text-gray-400 ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
          )}
        </div>

        <div className="flex items-center mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-6 w-6 ${
                  i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {review.rating} out of 5
          </span>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">{review.title || 'Untitled Review'}</h2>
            <p className="text-gray-700 dark:text-gray-300">{review.content}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {review.pros && (
              <div>
                <h3 className="text-lg font-medium text-green-600 dark:text-green-400 mb-2">
                  Pros
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                  Cons
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{review.cons}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}