'use client';

import { useEffect, useState } from 'react';
import { withAuth } from '@/lib/auth/withAuth';
import { supabase } from '@/lib/supabaseClient';

interface DashboardStats {
  total_users: number;
  total_companies: number;
  total_reviews: number;
  average_rating: number;
  pending_reviews: number;
  pending_verifications: number;
}

interface ReviewWithRating {
  rating: number | null;
}

function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_companies: 0,
    total_reviews: 0,
    average_rating: 0,
    pending_reviews: 0,
    pending_verifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        const { count: companyCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        const { data: ratings } = await supabase
          .from('reviews')
          .select('rating')
          .not('rating', 'is', null) as { data: ReviewWithRating[] | null };

        const { count: pendingReviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: pendingVerificationCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', false);

        const averageRating = ratings && ratings.length > 0
          ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length
          : 0;

        setStats({
          total_users: userCount || 0,
          total_companies: companyCount || 0,
          total_reviews: reviewCount || 0,
          average_rating: averageRating,
          pending_reviews: pendingReviewCount || 0,
          pending_verifications: pendingVerificationCount || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-600">Loading dashboard stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-600">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700">Total Users</h3>
              <p className="text-3xl font-bold text-blue-900">{stats.total_users}</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700">Total Companies</h3>
              <p className="text-3xl font-bold text-green-900">{stats.total_companies}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-700">Total Reviews</h3>
              <p className="text-3xl font-bold text-purple-900">{stats.total_reviews}</p>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-700">Average Rating</h3>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.average_rating.toFixed(1)}
              </p>
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-700">Pending Reviews</h3>
              <p className="text-3xl font-bold text-red-900">{stats.pending_reviews}</p>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-700">Pending Verifications</h3>
              <p className="text-3xl font-bold text-indigo-900">{stats.pending_verifications}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminPage);
