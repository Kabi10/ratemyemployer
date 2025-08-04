'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const metadata = {
  title: 'MCP Demo | RateMyEmployer',
  description: 'Model Context Protocol integration has been moved to admin tools',
};

export default function MCPDemoPage() {
  const router = useRouter();
  const { userRole } = useAuth();

  useEffect(() => {
    // Redirect admin users to the admin MCP demo
    if (isFeatureEnabled('mcpDemo', userRole)) {
      router.push('/admin/mcp-demo');
    }
  }, [router, userRole]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Analytics</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Intelligent Data Insights</h2>
              <p className="mb-6 text-gray-600">
                Our platform now features enhanced analytics powered by advanced data processing.
                Explore comprehensive insights about companies, industries, and workplace trends.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                  href="/fame"
                  className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold mb-2 text-green-600">Wall of Fame</h3>
                  <p className="text-sm text-gray-600">
                    Discover top-rated companies and industry leaders with excellent workplace cultures.
                  </p>
                </Link>

                <Link
                  href="/shame"
                  className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold mb-2 text-red-600">Wall of Shame</h3>
                  <p className="text-sm text-gray-600">
                    View companies with concerning workplace practices and low employee satisfaction.
                  </p>
                </Link>

                <Link
                  href="/companies"
                  className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold mb-2 text-blue-600">Company Directory</h3>
                  <p className="text-sm text-gray-600">
                    Browse our comprehensive database of companies with detailed analytics and insights.
                  </p>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">What's New</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Enhanced industry statistics and comparisons</li>
                  <li>Improved location-based analytics</li>
                  <li>Real-time data processing for accurate insights</li>
                  <li>Advanced filtering and search capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}