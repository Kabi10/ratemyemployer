'use client'


import { MonthlyReview } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch total reviews and average rating
        const { data: totalData, error: totalError } = await supabase
          .from('reviews')
          .select('rating');

        if (totalError) throw totalError;

        const { totalReviews, averageRating } = calculateTotalStats(totalData);

        // Fetch reviews by month
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('reviews')
          .select('created_at, rating')
          .order('created_at');

        if (monthlyError) throw monthlyError;

        const reviewsByMonth = processMonthlyData(monthlyData);

        // Calculate rating distribution
        const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
          rating: i + 1,
          count: totalData.filter(r => r.rating === i + 1).length,
        }));

        setAnalytics({
          totalReviews,
          averageRating,
          reviewsByMonth,
          ratingDistribution,
        });
      } catch (err: unknown) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const handleError = (error: unknown) => {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
    setError(error instanceof Error ? error.message : 'An error occurred');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) return null;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalReviews}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.averageRating.toFixed(1)}</p>
        </div>
      </div>

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
                <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Number of Reviews" />
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
    </AdminLayout>
  );
}