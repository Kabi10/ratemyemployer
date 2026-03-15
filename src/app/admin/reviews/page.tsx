export const dynamic = 'force-dynamic';
export const revalidate = 0;

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { withAuth } from '@/lib/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
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
import { SpamIndicator } from '@/components/SpamIndicator';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, AlertTriangle, Filter, LucideFilter, RefreshCw, UserCheck } from 'lucide-react';

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
  moderation_note?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  company: {
    id: number;
    name: string;
    industry: string | null;
    location: string | null;
  } | null;
  reviewer: {
    id: string;
    created_at: string | null;
    email: string | null;
    review_count: number;
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
  const [bulkApproveSelected, setBulkApproveSelected] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'pending');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [showPossibleSpamOnly, setShowPossibleSpamOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        
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
            reviewer:profiles (
              id,
              created_at,
              email,
              review_count:reviews(count)
            )
          `);
          
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }
        
        const { data, error, count } = await query
          .order(sortField, { ascending: sortOrder === 'asc' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
          
        if (error) throw error;
        
        const reviewsWithSpamChecks = data as Review[];
        
        setReviews(reviewsWithSpamChecks);
        setTotalCount(count || 0);
        
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching reviews:', err);
        toast({
          title: "Error",
          description: "Failed to fetch reviews. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReviews();
  }, [statusFilter, searchQuery, currentPage, sortField, sortOrder, toast]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (statusFilter !== 'all') params.set('status', statusFilter);
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
      // Store moderation history
      const moderationHistoryEntries = selectedReviews.map(reviewId => {
        const review = reviews.find(r => r.id === reviewId);
        return {
          review_id: reviewId,
          action: action,
          note: moderationNote,
          previous_status: review?.status || null,
          new_status: action,
          moderator_id: user?.id
        };
      });

      // Update reviews
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

      // Add moderation history entries
      const { error: historyError } = await supabase
        .from('moderation_history')
        .insert(moderationHistoryEntries);

      if (historyError) {
        console.error('Error saving moderation history:', historyError);
        // Continue anyway since the primary action succeeded
      }

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
      setBulkApproveSelected(false);
      
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

  // Handle individual review update
  const handleUpdateReviewStatus = async (reviewId: number, status: string, note?: string) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      // Update the review
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ 
          status,
          moderation_note: note || review.moderation_note,
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .eq('id', reviewId);

      if (updateError) throw updateError;

      // Add moderation history entry
      const { error: historyError } = await supabase
        .from('moderation_history')
        .insert({
          review_id: reviewId,
          action: status,
          note: note || null,
          previous_status: review.status,
          new_status: status,
          moderator_id: user?.id
        });

      if (historyError) {
        console.error('Error saving moderation history:', historyError);
        // Continue anyway since the primary action succeeded
      }

      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId
          ? { 
              ...r, 
              status,
              moderation_note: note || r.moderation_note,
              moderated_at: new Date().toISOString(),
              moderated_by: user?.id
            }
          : r
      ));
      
      toast({
        title: `Review ${status}ed`,
        description: `Successfully ${status}ed the review.`,
        variant: "default",
      });
    } catch (err) {
      console.error(`Error updating review:`, err);
      toast({
        title: "Error",
        description: `Failed to update the review. Please try again.`,
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

  // Select all reviews
  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(review => review.id));
    }
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

  // Filter reviews by spam indicator
  const filteredReviews = showPossibleSpamOnly 
    ? reviews.filter(review => {
        // This is a simplified version - the actual filtering would be done 
        // based on the SpamIndicator's assessment which we don't have direct access to here
        const hasSpamIndicators = 
          (review.title?.toUpperCase() === review.title && review.title?.length > 10) ||
          (review.pros && review.pros.length < 30) ||
          (review.cons && review.cons.length < 30) ||
          (/!{3,}/.test(review.title || '') || /\?{3,}/.test(review.title || '')) ||
          (review.reviewer?.created_at && 
            (new Date().getTime() - new Date(review.reviewer.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000);
        return hasSpamIndicators;
      })
    : reviews;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
            <Button
              variant={showPossibleSpamOnly ? "default" : "outline"}
              onClick={() => setShowPossibleSpamOnly(!showPossibleSpamOnly)}
              title="Show potential spam only"
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoading(true);
                // Refetch with current params
                setTimeout(() => {
                  router.refresh();
                }, 100);
              }}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Bulk actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedReviews.length} reviews selected
              </span>
              <Checkbox 
                id="auto-approve" 
                checked={bulkApproveSelected}
                onCheckedChange={(checked) => setBulkApproveSelected(checked as boolean)}
              />
              <label htmlFor="auto-approve" className="text-sm cursor-pointer">
                Auto-approve similar reviews
              </label>
            </div>
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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h3 className="text-lg font-medium text-red-800">Error loading reviews</h3>
            <p className="mt-2 text-red-700">{error.message}</p>
            <Button className="mt-4" onClick={() => router.refresh()}>
              Try Again
            </Button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700">No reviews found</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery 
                ? `No reviews matching "${searchQuery}" were found.` 
                : showPossibleSpamOnly
                  ? "No potential spam reviews found."
                  : `There are no reviews with status "${statusFilter}".`
              }
            </p>
            <div className="flex justify-center mt-4 space-x-2">
              <Button onClick={() => {
                setShowPossibleSpamOnly(false);
                setSearchQuery('');
                setStatusFilter('pending');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center mb-2 border-b pb-2">
              <Checkbox 
                id="select-all" 
                checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                onCheckedChange={toggleSelectAll}
                className="mr-2"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All
              </label>
              <div className="ml-auto text-sm text-gray-500">
                Showing {filteredReviews.length} of {totalCount} reviews
              </div>
            </div>
            
            {filteredReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={() => toggleReviewSelection(review.id)}
                        className="mr-2"
                      />
                      <CardTitle className="text-lg">{review.title || 'Untitled Review'}</CardTitle>
                      {getStatusBadge(review.status)}
                      
                      {/* Spam Indicator */}
                      <div className="ml-2">
                        <SpamIndicator 
                          reviewTitle={review.title || ''} 
                          reviewContent={`${review.pros || ''} ${review.cons || ''}`}
                          reviewerId={review.reviewer?.id || null}
                          reviewerJoinDate={review.reviewer?.created_at}
                        />
                      </div>
                    </div>
                    <CardDescription className="mt-1">
                      {review.company?.name} • {review.position || 'Unknown Position'} • {review.employment_status || 'Unknown Status'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center text-2xl font-bold text-yellow-500">
                    {review.rating}/5
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Pros</h4>
                      <p className="text-sm text-gray-700">{review.pros || 'None provided'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Cons</h4>
                      <p className="text-sm text-gray-700">{review.cons || 'None provided'}</p>
                    </div>
                  </div>
                  
                  {/* Reviewer info */}
                  <div className="mt-4 pt-2 border-t text-xs text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> 
                      {review.reviewer?.email || 'Unknown user'}
                    </span>
                    {review.reviewer?.review_count && (
                      <span>{(review.reviewer.review_count as any)[0].count || 0} total reviews</span>
                    )}
                    {review.reviewer?.created_at && (
                      <span>Joined {formatDateDisplay(review.reviewer.created_at)}</span>
                    )}
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
            ))}
          </div>
        )}
        
        {/* Pagination */}
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
                const pageNum = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <span className="px-2">...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => setCurrentPage(totalPages)}
                      isActive={currentPage === totalPages}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
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
=======
import AdminReviewsClient from './AdminReviewsClient';

export default function Page() {
  return <AdminReviewsClient />;
}
>>>>>>> feature/remove-mcp-demo-pages
