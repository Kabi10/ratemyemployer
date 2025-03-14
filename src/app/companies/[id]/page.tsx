'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/hooks/useCompany';
import { CompanyNews } from '@/components/CompanyNews';
import { ReviewList } from '@/components/ReviewList';
import { ReviewForm } from '@/components/ReviewForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Button } from '@/components/ui/button';

export default function CompanyPage() {
  const { id } = useParams() as { id: string };
  const { company, loading, error } = useCompany(id);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={typeof error === 'string' ? error : 'An error occurred'} />;
  }

  if (!company) {
    return <ErrorDisplay message="Company not found" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {company.name}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-4">
                <span>{company.industry}</span>
                {company.location && (
                  <>
                    <span>•</span>
                    <span>{company.location}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>

          {company.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {company.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Rating
              </h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {company.average_rating?.toFixed(1) || 'N/A'}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Based on {company.total_reviews || 0} reviews
              </p>
            </div>

            {company.website && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Website
                </h3>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {showReviewForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
            <ReviewForm
              companyId={company.id}
              onSuccess={() => setShowReviewForm(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>
              {company.id && <ReviewList companyId={String(company.id)} />}
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Recent News</h2>
              <CompanyNews companyName={company.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}