'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedReviewList } from './EnhancedReviewList';
import type { Review } from '@/types/database';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { toast } from './ui/use-toast';
import { CreateReview } from './CreateReview';
import { Dialog, DialogContent } from './ui/dialog';

interface EnhancedReviewListContainerProps {
  initialReviews: Review[];
  initialCount: number;
  companyId?: string;
}

export const EnhancedReviewListContainer = ({
  initialReviews,
  initialCount,
  companyId,
}: EnhancedReviewListContainerProps) => {
  const router = useRouter();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Function to fetch reviews with all possible filters
  const fetchReviews = async (filters: Record<string, any>) => {
    try {
      console.log('Fetching reviews with filters:', filters);
      
      let query = supabase
        .from('reviews')
        .select('*, company:companies(*)', { count: 'exact' });
      
      // Apply filters
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      // Only show approved reviews for regular users
      query = query.eq('status', 'approved');
      
      // Rating filter
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating);
      }
      
      // Employment status filter
      if (filters.employmentStatus && filters.employmentStatus !== 'all') {
        query = query.eq('employment_status', filters.employmentStatus);
      }
      
      // Current employee filter
      if (filters.isCurrentEmployee) {
        query = query.eq('is_current_employee', true);
      }
      
      // Time period filter
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      // Sort options
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'highest':
            query = query.order('rating', { ascending: false });
            break;
          case 'lowest':
            query = query.order('rating', { ascending: true });
            break;
          case 'most_helpful':
            query = query.order('helpful_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        // Default sort
        query = query.order('created_at', { ascending: false });
      }
      
      // Pagination
      if (filters.page && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        query = query.range(start, start + filters.limit - 1);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching reviews:', error);
        throw new Error(error.message);
      }
      
      return {
        data: data as Review[],
        error: null,
        count: count || 0
      };
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return {
        data: null,
        error: error as Error,
        count: 0
      };
    }
  };

  // Handle creating a new review
  const handleCreateReview = () => {
    setShowReviewForm(true);
  };

  // Handle review creation success
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    toast({
      title: "Review Submitted",
      description: "Your review has been submitted for moderation",
      variant: "success",
    });
    // Refresh the page to update the reviews list
    router.refresh();
  };

  return (
    <>
      <EnhancedReviewList
        reviews={initialReviews}
        totalCount={initialCount}
        fetchReviews={fetchReviews}
        companyId={companyId}
        showCreateReview={true}
        onCreateReview={handleCreateReview}
      />
      
      {/* Review Form Modal */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <CreateReview 
            companyId={companyId} 
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}; 