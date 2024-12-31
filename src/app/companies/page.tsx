'use client';

import { Suspense, lazy } from 'react';
import { FloatingAddButton } from '@/components/FloatingAddButton';

// Lazy load components
const SearchAndFilter = lazy(() => import('@/components/SearchAndFilter'));
const CompanyList = lazy(() => import('@/components/CompanyList'));

// Loading fallbacks
function SearchSkeleton() {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      </div>
    </div>
  );
}

function CompanyListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Companies</h1>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchAndFilter />
      </Suspense>

      <Suspense fallback={<CompanyListSkeleton />}>
        <CompanyList />
      </Suspense>

      <FloatingAddButton />
    </main>
  );
}
