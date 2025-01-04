'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminLayout } from '@/components/layouts/AdminLayout';
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

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  reviewsByMonth: {
    month: string;
    count: number;
    averageRating: number;
  }[];
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
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

        const totalReviews = totalData.length;
        const averageRating = totalData.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

        // Fetch reviews by month
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('reviews')
          .select('created_at, rating')
          .order('created_at');

        if (monthlyError) throw monthlyError;

        const reviewsByMonth = monthlyData.reduce((acc: any[], curr) => {
          const month = new Date(curr.created_at).toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          });
          const existingMonth = acc.find(m => m.month === month);

          if (existingMonth) {
            existingMonth.count++;
            existingMonth.totalRating += curr.rating;
            existingMonth.averageRating = existingMonth.totalRating / existingMonth.count;
          } else {
            acc.push({
              month,
              count: 1,
              totalRating: curr.rating,
              averageRating: curr.rating,
            });
          }
          return acc;
        }, []);

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
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

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
