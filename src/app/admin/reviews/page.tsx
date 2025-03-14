'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { withAuth } from '@/lib/auth/withAuth';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import { supabase } from '@/lib/supabaseClient';
import { formatDateDisplay } from '@/utils/date';

interface Review {
  id: number;
  title: string | null;
  content: string | null;
  pros: string | null;
  cons: string | null;
  rating: number | null;
  created_at: string | null;
  status: string | null;
  position: string | null;
  employment_status: string | null;
  company: {
    id: number;
    name: string;
    industry: string | null;
    location: string | null;
  } | null;
}

function AdminReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const itemsPerPage = 10;

  // Fetch reviews with filters and pagination
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      try {
        // Build query
        let query = supabase
          .from('reviews')
          .select(`
            *,
            company:companies (
              id,
              name,
              industry,
              location
            )
          `, { count: 'exact' });
        
        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,company.name.ilike.%${searchQuery}%`);
        }
        
        // Apply pagination
        const start = (currentPage - 1) * itemsPerPage;
        query = query
          .order('created_at', { ascending: false })
          .range(start, start + itemsPerPage - 1);
        
        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setReviews(data as Review[]);
          setTotalCount(count || 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
    
    // Update URL with filters
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', url);
    
  }, [statusFilter, searchQuery, currentPage]);

  // Handle review status updates
  const handleUpdateReviewStatus = async (reviewId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, status: newStatus }
          : review
      ));
      
      // Show success toast
      toast({
        title: `Review ${newStatus}`,
        description: `The review has been ${newStatus} successfully.`,
        variant: "default",
      });
    } catch (err) {
      console.error(`Error ${newStatus} review:`, err);
      toast({
        title: "Error",
        description: `Failed to ${newStatus} the review. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Render loading state
  if (isLoading && reviews.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  // Render error state
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

  // Render status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Review Management</h1>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {review.title || 'Untitled Review'}
                      </CardTitle>
                      <CardDescription>
                        {review.company?.name || 'Unknown Company'} • 
                        {review.position || 'Position not specified'} • 
                        {getStatusBadge(review.status)}
                      </CardDescription>
                    </div>
                    <div className="text-sm font-medium">
                      Rating: {review.rating || 'N/A'}/5
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {(review.pros || review.cons) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {review.pros && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <h4 className="font-medium text-green-700 mb-1">Pros</h4>
                          <p className="text-sm text-gray-700">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="bg-red-50 p-3 rounded-md">
                          <h4 className="font-medium text-red-700 mb-1">Cons</h4>
                          <p className="text-sm text-gray-700">{review.cons}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700 mb-4">{review.content || 'No content provided'}</p>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Posted on {formatDateDisplay(review.created_at)}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-end space-x-2 pt-3 pb-3">
                  {review.status === 'pending' && (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUpdateReviewStatus(review.id, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  {review.status === 'rejected' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                    >
                      Mark as Approved
                    </Button>
                  )}
                  {review.status === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateReviewStatus(review.id, 'rejected')}
                    >
                      Mark as Rejected
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No reviews found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum = currentPage;
                if (currentPage < 3) {
                  pageNum = i + 1;
                } else if (currentPage > totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                // Ensure page numbers are within range
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminReviewsPage);