'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabaseClient';
import { withAuth } from '@/lib/auth/withAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  Star, 
  FileText, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_companies: number;
  total_reviews: number;
  average_rating: number;
  pending_reviews: number;
  pending_verifications: number;
  recent_reviews: RecentReview[];
  recent_companies: RecentCompany[];
}

interface RecentReview {
  id: number;
  title: string | null;
  company_name: string | null;
  rating: number | null;
  created_at: string | null;
  status: string | null;
}

interface RecentCompany {
  id: number;
  name: string;
  industry: string | null;
  created_at: string | null;
  total_reviews: number | null;
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
    pending_verifications: 0,
    recent_reviews: [],
    recent_companies: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch company count and recent companies
        const { count: companyCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
          
        const { data: recentCompanies } = await supabase
          .from('companies')
          .select('id, name, industry, created_at, total_reviews')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch review count, ratings, and recent reviews
        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        const { data: ratings } = await supabase
          .from('reviews')
          .select('rating')
          .not('rating', 'is', null) as { data: ReviewWithRating[] | null };
          
        const { data: recentReviews } = await supabase
          .from('reviews')
          .select('id, title, company_name, rating, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch pending counts
        const { count: pendingReviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: pendingVerificationCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending');

        // Calculate average rating
        const averageRating = ratings && ratings.length > 0
          ? ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length
          : 0;

        setStats({
          total_users: userCount || 0,
          total_companies: companyCount || 0,
          total_reviews: reviewCount || 0,
          average_rating: averageRating,
          pending_reviews: pendingReviewCount || 0,
          pending_verifications: pendingVerificationCount || 0,
          recent_reviews: recentReviews || [],
          recent_companies: recentCompanies || []
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': 
      default: return 'text-yellow-600';
    }
  };

  // Get rating stars
  const getRatingStars = (rating: number | null) => {
    if (!rating) return '☆☆☆☆☆';
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-300 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total_users}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/users" passHref>
                <Button variant="link" className="p-0 h-auto text-blue-700 dark:text-blue-300">
                  View all users
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-700 dark:text-green-300 flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Total Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.total_companies}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/companies" passHref>
                <Button variant="link" className="p-0 h-auto text-green-700 dark:text-green-300">
                  View all companies
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-700 dark:text-purple-300 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.total_reviews}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/reviews" passHref>
                <Button variant="link" className="p-0 h-auto text-purple-700 dark:text-purple-300">
                  View all reviews
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300 flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {stats.average_rating.toFixed(1)} / 5
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/analytics" passHref>
                <Button variant="link" className="p-0 h-auto text-yellow-700 dark:text-yellow-300">
                  View analytics
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-700 dark:text-red-300 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.pending_reviews}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/reviews?status=pending" passHref>
                <Button variant="link" className="p-0 h-auto text-red-700 dark:text-red-300">
                  View pending reviews
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-indigo-700 dark:text-indigo-300 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.pending_verifications}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/admin/companies?verification=pending" passHref>
                <Button variant="link" className="p-0 h-auto text-indigo-700 dark:text-indigo-300">
                  View pending verifications
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Recent Reviews
              </CardTitle>
              <CardDescription>The 5 most recent reviews submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_reviews.length > 0 ? (
                  stats.recent_reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{review.title || 'Untitled Review'}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {review.company_name || 'Unknown Company'} • {formatDate(review.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500">{getRatingStars(review.rating)}</span>
                          <span className={`text-xs font-medium ${getStatusColor(review.status)}`}>
                            {review.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No recent reviews found</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/reviews" passHref>
                <Button variant="outline" size="sm">View All Reviews</Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Recent Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Recent Companies
              </CardTitle>
              <CardDescription>The 5 most recently added companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_companies.length > 0 ? (
                  stats.recent_companies.map(company => (
                    <div key={company.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {company.industry || 'Unknown Industry'} • {formatDate(company.created_at)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {company.total_reviews || 0} reviews
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No recent companies found</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/companies" passHref>
                <Button variant="outline" size="sm">View All Companies</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminPage, { requiredRole: 'admin' });