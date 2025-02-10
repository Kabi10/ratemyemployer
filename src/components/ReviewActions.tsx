'use client';

import * as React from 'react';
import type { MouseEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui-library/button';
import { useToast } from '@/components/ui-library/use-toast';
import { ReviewId } from '@/types/database';

interface ReviewActionsProps {
  reviewId: ReviewId;
  initialLikes: number;
  isLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  onReportClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onEditClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function ReviewActions({
  reviewId,
  initialLikes,
  isLiked: initialIsLiked = false,
  onLikeChange,
  onReportClick,
  onEditClick,
}: ReviewActionsProps) {
  const [isLiked, setIsLiked] = React.useState(initialIsLiked);
  const [likeCount, setLikeCount] = React.useState<number>(initialLikes);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  React.useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  React.useEffect(() => {
    setLikeCount(initialLikes);
  }, [initialLikes]);

  const handleLikeClick = async (e: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like reviews',
        variant: 'destructive',
      });
      return;
    }

    const userId = session.user.id;
    setIsLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('review_likes')
          .delete()
          .eq('user_id', userId)
          .eq('review_id', reviewId);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount((prev: number) => Math.max(0, prev - 1));
        onLikeChange?.(false);
      } else {
        // Like
        const { error } = await supabase.from('review_likes').insert({
          user_id: userId,
          review_id: reviewId,
        });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount((prev: number) => prev + 1);
        onLikeChange?.(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating like status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    // ... existing delete logic ...
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeClick}
      disabled={isLoading}
      className={`transition-colors duration-200 ${
        isLiked
          ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
          : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : 'scale-100'}`}
      />
      <span className="ml-2">{isLiked ? 'Unlike' : 'Like'}</span>
      <span className="ml-1">({likeCount})</span>
    </Button>
  );
}
