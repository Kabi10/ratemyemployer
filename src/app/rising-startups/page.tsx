import { Metadata } from 'next';
import { RisingStartupsSection } from '@/components/RisingStartupsSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Rising Startups - RateMyEmployer',
  description: 'Discover promising startups and rapidly growing companies. Track funding rounds, expansion plans, and growth indicators to identify the next big opportunities.',
  keywords: 'rising startups, growth companies, funding rounds, career opportunities, startup jobs',
  openGraph: {
    title: 'Rising Startups - RateMyEmployer',
    description: 'Discover promising startups and rapidly growing companies with exceptional growth potential.',
    type: 'website',
  },
};

export default function RisingStartupsPage() {
  return (
    <ErrorBoundary fallback={<RisingStartupsFallback />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<RisingStartupsLoading />}>
            <RisingStartupsSection 
              limit={50}
              showFilters={true}
              showStatistics={true}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function RisingStartupsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RisingStartupsFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rising Startups
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Service Temporarily Unavailable
            </h2>
            <p className="text-red-600 mb-4">
              We're experiencing technical difficulties with the Rising Startups feature. 
              Please try again later or contact support if the issue persists.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
