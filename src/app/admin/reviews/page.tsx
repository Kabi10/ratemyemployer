'use client'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
import { ModerationHistoryModal } from '@/components/modals/ModerationHistoryModal';

import { supabase } from '@/lib/supabaseClient';
import { formatDateDisplay } from '@/utils/date';
import { useAuth } from '@/contexts/AuthContext';

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
  moderation_note?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  company: {
    id: number;
    name: string;
    industry: string | null;
    location: string | null;
  } | null;
}

interface ModerationAction {
  reviewId: number;
  action: 'approve' | 'reject';
  note: string;
}

function AdminReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [moderationNote, setModerationNote] = useState<string>('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [moderationHistory, setModerationHistory] = useState<any[]>([]);
  const [selectedReviewForHistory, setSelectedReviewForHistory] = useState<Review | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
  const itemsPerPage = 10;

  // Fetch reviews with enhanced filters and sorting
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('reviews')
          .select(`
            *,
            company:companies (
              id,
              name,
              industry,
              location
            ),
            moderated_by:profiles (
              id,
              full_name,
              email
            )
          `, { count: 'exact' });
        
        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.or(`
            title.ilike.%${searchQuery}%,
            content.ilike.%${searchQuery}%,
            pros.ilike.%${searchQuery}%,
            cons.ilike.%${searchQuery}%,
            company.name.ilike.%${searchQuery}%
          `);
        }
        
        // Apply sorting
        query = query.order(sortField, { ascending: sortOrder === 'asc' });
        
        // Apply pagination
        const start = (currentPage - 1) * itemsPerPage;
        query = query.range(start, start + itemsPerPage - 1);
        
        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

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
    
    // Update URL with filters and sorting
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (sortField !== 'created_at') params.set('sort', sortField);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', url);
  }, [statusFilter, searchQuery, currentPage, sortField, sortOrder]);

  // Handle bulk moderation
  const handleBulkModeration = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) {
      toast({
        title: "No Reviews Selected",
        description: "Please select at least one review to moderate.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ 
          status: action,
          moderation_note: moderationNote || null,
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .in('id', selectedReviews);

      if (updateError) throw updateError;

      // Update local state
      setReviews(reviews.map(review => 
        selectedReviews.includes(review.id)
          ? { 
              ...review, 
              status: action,
              moderation_note: moderationNote,
              moderated_at: new Date().toISOString(),
              moderated_by: user?.id
            }
          : review
      ));
      
      // Clear selection and note
      setSelectedReviews([]);
      setModerationNote('');
      
      toast({
        title: `Reviews ${action}ed`,
        description: `Successfully ${action}ed ${selectedReviews.length} reviews.`,
        variant: "default",
      });
    } catch (err) {
      console.error(`Error ${action}ing reviews:`, err);
      toast({
        title: "Error",
        description: `Failed to ${action} the selected reviews. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Toggle review selection
  const toggleReviewSelection = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Fetch moderation history
  const fetchModerationHistory = async (review: Review) => {
    try {
      const { data, error } = await supabase
        .from('moderation_history')
        .select(`
          *,
          moderator:profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('review_id', review.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setModerationHistory(data || []);
      setSelectedReviewForHistory(review);
    } catch (err) {
      console.error('Error fetching moderation history:', err);
      toast({
        title: "Error",
        description: "Failed to fetch moderation history.",
        variant: "destructive",
      });
    }
  };

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
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="moderated_at">Date Moderated</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
        
        {/* Bulk actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedReviews.length} reviews selected
            </span>
            <Input
              placeholder="Add moderation note..."
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              className="max-w-md"
            />
            <Button
              variant="default"
              onClick={() => handleBulkModeration('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Selected
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleBulkModeration('reject')}
            >
              Reject Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedReviews([])}
            >
              Clear Selection
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleReviewSelection(review.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
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
                <CardFooter className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Created: {formatDateDisplay(review.created_at)}</span>
                    {review.moderated_at && (
                      <>
                        <span>•</span>
                        <span>
                          Moderated: {formatDateDisplay(review.moderated_at)}
                        </span>
                      </>
                    )}
                    {review.moderation_note && (
                      <>
                        <span>•</span>
                        <span>
                          Note: {review.moderation_note}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchModerationHistory(review)}
                    >
                      History
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateReviewStatus(review.id, 'approved')}
                      disabled={review.status === 'approved'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateReviewStatus(review.id, 'rejected')}
                      disabled={review.status === 'rejected'}
                    >
                      Reject
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No reviews found matching your criteria
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
      
      <ModerationHistoryModal
        isOpen={!!selectedReviewForHistory}
        onClose={() => setSelectedReviewForHistory(null)}
        history={moderationHistory}
        reviewTitle={selectedReviewForHistory?.title || 'Untitled Review'}
      />
    </AdminLayout>
  );
}

export default withAuth(AdminReviewsPage, { requiredRole: 'moderator' });
