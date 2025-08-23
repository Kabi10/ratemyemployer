'use client'

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CompanyList } from '@/components/CompanyList';
import { CompanyForm } from '@/components/CompanyForm';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabaseClient';

// Lazy load SearchAndFilter with no SSR
const SearchAndFilter = dynamic(() => import('@/components/SearchAndFilter'), {
  ssr: false,
  loading: () => <SearchSkeleton />
});

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
  const params = useSearchParams();
  const initialSearch = params.get('search')?.toString() || '';
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showAddCompany, setShowAddCompany] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 page-transition">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Companies</h1>
          <Button
            onClick={() => setShowAddCompany(true)}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-colors"
          >
            Add Company
          </Button>
        </div>

        <SearchAndFilter
          initialQuery={searchQuery}
          onLocationChange={setSelectedLocation}
          onIndustryChange={setSelectedIndustry}
          onSearch={setSearchQuery}
          selectedLocation={selectedLocation}
          selectedIndustry={selectedIndustry}
        />

        <div className="mt-12">
          <Suspense fallback={<CompanyListSkeleton />}>
            <CompanyList
              selectedLocation={selectedLocation}
              selectedIndustry={selectedIndustry}
              searchQuery={searchQuery}
            />
          </Suspense>
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity dialog-backdrop" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md dialog-content">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Add New Company
                        </h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAddCompany(false)}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <CompanyForm onSuccess={() => setShowAddCompany(false)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}