'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';

interface Stats {
  totalCompanies: number;
  totalReviews: number;
  totalUsers: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalReviews: 0,
    totalUsers: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_stats');
        if (error) throw error;
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
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

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Companies</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCompanies}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalReviews}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              href="/admin/analytics"
              className="block w-full py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-center"
            >
              View Analytics
            </Link>
            <Link
              href="/admin/companies"
              className="block w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
            >
              Manage Companies
            </Link>
            <Link
              href="/admin/reviews"
              className="block w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-center"
            >
              Manage Reviews
            </Link>
            <Link
              href="/admin/users"
              className="block w-full py-2 px-4 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-center"
            >
              Manage Users
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Database Status</span>
              <span className="text-green-500">●</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Storage Status</span>
              <span className="text-green-500">●</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Auth Service</span>
              <span className="text-green-500">●</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
