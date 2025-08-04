'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMCPQuery, useIndustryStatistics, useLocationStatistics } from '@/hooks/useMCPQuery';
import {
  CompanyData,
  IndustryStatistic,
  LocationStatistic,
  ReviewData,
  MCP_PROCEDURES
} from '@/types/mcp';
import { Database, Activity, TrendingUp, MapPin, Building2 } from 'lucide-react';

// Enhanced MCP Developer Tools Component with proper TypeScript types
export default function MCPDemoComponent() {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  
  // MCP-powered queries with proper types
  const {
    data: topCompanies,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies
  } = useMCPQuery<CompanyData[]>(
    MCP_PROCEDURES.GET_TOP_RATED_COMPANIES,
    { limit: 5 },
    { enabled: activeDemo === 'companies' }
  );

  const {
    data: recentReviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews
  } = useMCPQuery<ReviewData[]>(
    MCP_PROCEDURES.GET_RECENT_REVIEWS,
    { limit: 10 },
    { enabled: activeDemo === 'reviews' }
  );
  
  // Enhanced statistics with MCP
  const {
    data: industryStats,
    loading: industryLoading,
    error: industryError
  } = useIndustryStatistics({
    enabled: activeDemo === 'statistics',
    refreshInterval: 300000
  });

  const {
    data: locationStats,
    loading: locationLoading,
    error: locationError
  } = useLocationStatistics({
    enabled: activeDemo === 'statistics',
    refreshInterval: 300000
  });
  
  const getRatingColor = (rating: number): string => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };
  
  const demos = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'companies', label: 'Top Companies', icon: Building2 },
    { id: 'reviews', label: 'Recent Reviews', icon: Activity },
    { id: 'statistics', label: 'Statistics', icon: TrendingUp },
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">MCP Developer Tools</h1>
        <p className="text-gray-600">
          Test and monitor Model Context Protocol integration with type-safe queries and real-time data.
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <Button
              key={demo.id}
              variant={activeDemo === demo.id ? "default" : "outline"}
              onClick={() => setActiveDemo(demo.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {demo.label}
            </Button>
          );
        })}
      </div>
      {/* Demo Content */}
      <div className="space-y-6">
        {activeDemo === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                MCP Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Active Procedures</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>get_industry_statistics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>get_location_statistics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>get_top_rated_companies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>get_recent_reviews</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Integration Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Type-safe query hooks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Automatic retry mechanisms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Fallback query support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Real-time data refresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {activeDemo === 'companies' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Top Rated Companies
              </CardTitle>
              <Button
                onClick={refetchCompanies}
                variant="outline"
                size="sm"
                disabled={companiesLoading}
              >
                {companiesLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {companiesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : companiesError ? (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  Error: {companiesError}
                </div>
              ) : topCompanies && topCompanies.length > 0 ? (
                <div className="space-y-4">
                  {topCompanies.map((company) => (
                    <div key={company.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.industry} • {company.location}</p>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getRatingColor(company.average_rating || 0)}`}>
                            {company.average_rating?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(company.total_reviews || 0)} reviews
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No companies data available</p>
              )}
            </CardContent>
          </Card>
        )}
        {activeDemo === 'reviews' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
              <Button
                onClick={refetchReviews}
                variant="outline"
                size="sm"
                disabled={reviewsLoading}
              >
                {reviewsLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : reviewsError ? (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  Error: {reviewsError}
                </div>
              ) : recentReviews && recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{review.title}</h4>
                        <div className={`font-bold ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {review.position} • {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent reviews available</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeDemo === 'statistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Industry Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {industryLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : industryError ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">
                    Error: {industryError}
                  </div>
                ) : industryStats && industryStats.length > 0 ? (
                  <div className="space-y-4">
                    {industryStats.slice(0, 5).map((stat) => (
                      <div key={stat.industry} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{stat.industry}</span>
                          <span className={getRatingColor(stat.average_rating)}>
                            {stat.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatNumber(stat.company_count)} companies • {formatNumber(stat.review_count)} reviews
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No industry statistics available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {locationLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : locationError ? (
                  <div className="text-red-600 p-4 bg-red-50 rounded">
                    Error: {locationError}
                  </div>
                ) : locationStats && locationStats.length > 0 ? (
                  <div className="space-y-4">
                    {locationStats.slice(0, 5).map((stat) => (
                      <div key={stat.location} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{stat.location}</span>
                          <span className={getRatingColor(stat.average_rating)}>
                            {stat.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatNumber(stat.company_count)} companies • {formatNumber(stat.review_count)} reviews
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No location statistics available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Developer Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Developer Information</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-4">
            This interface demonstrates MCP integration with type-safe queries and real-time data processing.
            All queries use the <code className="bg-blue-100 px-1 rounded">useMCPQuery</code> hook with proper TypeScript types.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Available Hooks:</h4>
              <ul className="space-y-1">
                <li><code>useMCPQuery&lt;T&gt;</code></li>
                <li><code>useMCPQueryWithFallback&lt;T&gt;</code></li>
                <li><code>useIndustryStatistics</code></li>
                <li><code>useLocationStatistics</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Type Definitions:</h4>
              <ul className="space-y-1">
                <li><code>CompanyData</code></li>
                <li><code>IndustryStatistic</code></li>
                <li><code>LocationStatistic</code></li>
                <li><code>ReviewData</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}