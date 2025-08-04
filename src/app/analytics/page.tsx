'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndustryInsights } from '@/components/analytics/IndustryInsights';
import { LocationInsights } from '@/components/analytics/LocationInsights';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workplace Analytics</h1>
              <p className="mt-1 text-sm text-gray-600">
                Comprehensive insights into workplace satisfaction and industry trends
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>Powered by intelligent data processing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Industry Analysis</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15+</div>
                <p className="text-xs text-muted-foreground">
                  Industries analyzed with comprehensive ratings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Location Coverage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50+</div>
                <p className="text-xs text-muted-foreground">
                  Cities and regions with workplace data
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Real-time</div>
                <p className="text-xs text-muted-foreground">
                  Data updated every 5 minutes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ErrorBoundary>
              <Suspense fallback={
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }>
                <IndustryInsights limit={8} showTrends={true} />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }>
                <LocationInsights limit={6} />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>About These Analytics</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-gray-600 mb-4">
                  Our analytics platform provides real-time insights into workplace satisfaction across industries and locations. 
                  The data is continuously updated and processed using advanced algorithms to ensure accuracy and relevance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Employee reviews and ratings</li>
                      <li>• Company profile information</li>
                      <li>• Industry classification data</li>
                      <li>• Geographic location mapping</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time data processing</li>
                      <li>• Intelligent trend analysis</li>
                      <li>• Comprehensive industry coverage</li>
                      <li>• Location-based insights</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">How to Use This Data</h4>
                  <p className="text-sm text-blue-700">
                    Use these insights to understand industry trends, compare workplace satisfaction across locations, 
                    and make informed decisions about career opportunities. The ratings reflect real employee experiences 
                    and are updated regularly to maintain accuracy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
