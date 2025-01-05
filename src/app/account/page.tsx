'use client';

import { withAuth } from '@/lib/auth/withAuth';
import { useReviews } from '@/hooks/useReviews';

function AccountPage() {
  const { reviews, isLoading, error } = useReviews();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s an overview of your activity.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Reviews</h2>
            <a
              href="/companies"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Browse Companies &rarr;
            </a>
          </div>

          {reviews?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-4">Share your experiences and help others make informed decisions.</p>
              <a
                href="/companies"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Write Your First Review
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews?.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {review.company?.name || 'Unknown Company'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {review.employment_status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{review.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-medium">{review.rating}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">{review.position}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Protect the account page for authenticated users
export default withAuth(AccountPage);
