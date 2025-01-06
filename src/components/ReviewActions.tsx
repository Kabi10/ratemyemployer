'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewLike } from '@/types';

interface ReviewActionsProps {
  reviewId: number;
  userId?: string;
  initialLikes: number;
  onLikeChange?: (liked: boolean) => void;
}

export function ReviewActions({ reviewId, userId, initialLikes, onLikeChange }: ReviewActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkLikeStatus() {
      if (!userId) return;

      const { data, error } = await supabase
        .rpc('has_user_liked_review', {
          p_user_id: userId,
          p_review_id: reviewId
        });

      if (!error) {
        setIsLiked(!!data);
        onLikeChange?.(!!data);
      }
    }

    checkLikeStatus();
  }, [reviewId, userId, supabase, onLikeChange]);

  const handleLikeClick = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('review_likes')
          .delete()
          .eq('user_id', userId)
          .eq('review_id', reviewId);

        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
          onLikeChange?.(false);
        }
      } else {
        // Like
        const { error } = await supabase
          .from('review_likes')
          .insert({
            user_id: userId,
            review_id: reviewId
          });

        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          onLikeChange?.(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeClick}
      disabled={!userId || isLoading}
      className={isLiked ? 'text-red-500' : ''}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span className="ml-2">{isLiked ? 'Unlike' : 'Like'}</span>
      <span className="ml-1">({likeCount})</span>
    </Button>
  );
}
