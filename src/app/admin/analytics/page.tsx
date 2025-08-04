'use client'

import { MonthlyReview } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMCPQuery, useMCPQueryWithFallback } from '@/hooks/useMCPQuery';
import { AnalyticsSummary, TrendData } from '@/types/mcp';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Review {
  rating: number | null;
  created_at?: string | null;
}

interface ReviewWithRating extends Review {
  rating: number;
  created_at: string;
}

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  reviewsByMonth: MonthlyReview[];
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}

interface EnhancedAnalyticsData extends AnalyticsData {
  industryInsights?: {
    topIndustry: string;
    industryCount: number;
    avgIndustryRating: number;
  };
  locationInsights?: {
    topLocation: string;
    locationCount: number;
    avgLocationRating: number;
  };
  recentActivity?: {
    reviewsThisMonth: number;
    companiesAdded: number;
    trendDirection: 'up' | 'down' | 'stable';
  };
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Date not available';
  return new Date(dateString).toLocaleDateString();
}

function calculateAverageRating(reviews: Review[]): number {
  const validReviews = reviews.filter((review): review is Review & { rating: number } => 
    typeof review.rating === 'number'
  );
  if (validReviews.length === 0) return 0;
  return validReviews.reduce((acc, curr) => acc + curr.rating, 0) / validReviews.length;
}

function isValidReview(review: Review): review is Review & { rating: number; created_at: string } {
  return typeof review.rating === 'number' && typeof review.created_at === 'string';
}

function processMonthlyData(reviews: Review[]): MonthlyReview[] {
  const monthlyData: { [key: string]: MonthlyReview } = {};

  reviews
    .filter((review): review is Review & { rating: number } => 
      typeof review.rating === 'number' && review.created_at !== null
    )
    .forEach(review => {
      const month = new Date(review.created_at!).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      if (monthlyData[month]) {
        monthlyData[month].totalReviews++;
        monthlyData[month].totalRating += review.rating;
        monthlyData[month].averageRating = monthlyData[month].totalRating / monthlyData[month].totalReviews;
      } else {
        monthlyData[month] = {
          month,
          totalReviews: 1,
          totalRating: review.rating,
          averageRating: review.rating,
        };
      }
    });

  return Object.values(monthlyData);
}

function calculateTotalStats(reviews: { rating: number | null }[]): { totalReviews: number; averageRating: number } {
  const validReviews = reviews.filter((review): review is { rating: number } => 
    typeof review.rating === 'number'
  );
  
  if (validReviews.length === 0) {
    return { totalReviews: 0, averageRating: 0 };
  }

  const totalReviews = validReviews.length;
  const totalRating = validReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalRating / totalReviews;

  return { totalReviews, averageRating };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<EnhancedAnalyticsData | null>(null);

  // Use MCP for comprehensive analytics with fallback to direct queries
  const {
    data: mcpAnalytics,
    loading: mcpLoading,
    error: mcpError
  } = useMCPQueryWithFallback(
    'get_comprehensive_analytics',
    async () => {
      // Fallback to direct Supabase queries
      const { data: totalData, error: totalError } = await supabase
        .from('reviews')
        .select('rating');

      if (totalError) throw totalError;

      const { totalReviews, averageRating } = calculateTotalStats(totalData);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('reviews')
        .select('created_at, rating')
        .order('created_at');

      if (monthlyError) throw monthlyError;

      const reviewsByMonth = processMonthlyData(monthlyData);

      const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
        rating: i + 1,
        count: totalData.filter(r => r.rating === i + 1).length,
      }));

      return {
        data: {
          totalReviews,
          averageRating,
          reviewsByMonth,
          ratingDistribution,
        },
        error: null
      };
    },
    undefined,
    { enabled: true, refreshInterval: 300000 } // Refresh every 5 minutes
  );

  // Enhanced industry insights using MCP
  const { data: industryData } = useMCPQuery(
    'get_industry_statistics',
    undefined,
    { enabled: true }
  );

  // Enhanced location insights using MCP
  const { data: locationData } = useMCPQuery(
    'get_location_statistics',
    undefined,
    { enabled: true }
  );

  useEffect(() => {
    if (mcpAnalytics) {
      const enhancedData: EnhancedAnalyticsData = {
        ...mcpAnalytics,
        industryInsights: industryData && industryData.length > 0 ? {
          topIndustry: industryData[0].industry,
          industryCount: industryData.length,
          avgIndustryRating: industryData[0].average_rating
        } : undefined,
        locationInsights: locationData && locationData.length > 0 ? {
          topLocation: locationData[0].location,
          locationCount: locationData.length,
          avgLocationRating: locationData[0].average_rating
        } : undefined,
        recentActivity: {
          reviewsThisMonth: mcpAnalytics.totalReviews, // This could be enhanced with MCP
          companiesAdded: 0, // This could be enhanced with MCP
          trendDirection: 'stable' as const
        }
      };
      setAnalytics(enhancedData);
    }
  }, [mcpAnalytics, industryData, locationData]);

  if (mcpLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (mcpError) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Analytics Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {mcpError}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) return null;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
          <div className="text-sm text-gray-500">
            Powered by intelligent data processing
          </div>
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalReviews}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</p>
          </div>
          {analytics.industryInsights && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Top Industry</h3>
              <p className="text-xl font-bold text-purple-600">{analytics.industryInsights.topIndustry}</p>
              <p className="text-sm text-gray-500">{analytics.industryInsights.avgIndustryRating.toFixed(1)} avg rating</p>
            </div>
          )}
          {analytics.locationInsights && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Top Location</h3>
              <p className="text-xl font-bold text-orange-600">{analytics.locationInsights.topLocation}</p>
              <p className="text-sm text-gray-500">{analytics.locationInsights.avgLocationRating.toFixed(1)} avg rating</p>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Reviews Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.reviewsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalReviews" stroke="#3B82F6" name="Number of Reviews" />
                  <Line
                    type="monotone"
                    dataKey="averageRating"
                    stroke="#10B981"
                    name="Average Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Number of Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced insights section */}
        {(analytics.industryInsights || analytics.locationInsights) && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Intelligent Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics.industryInsights && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Industry Analysis</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {analytics.industryInsights.topIndustry} leads with {analytics.industryInsights.avgIndustryRating.toFixed(1)} average rating
                    across {analytics.industryInsights.industryCount} industries analyzed.
                  </p>
                </div>
              )}
              {analytics.locationInsights && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Location Analysis</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {analytics.locationInsights.topLocation} shows the highest satisfaction with {analytics.locationInsights.avgLocationRating.toFixed(1)} average rating
                    across {analytics.locationInsights.locationCount} locations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}