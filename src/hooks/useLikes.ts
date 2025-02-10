import { ReviewLike } from '@/types';

import { useState, useEffect } from 'react';

import { createBrowserClient } from '@supabase/ssr';

export function useLikes(reviewId: number, userId?: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkLikeStatus() {
      if (!userId) return;

      const { data, error } = await supabase.rpc('has_user_liked_review', {
        p_user_id: userId,
        p_review_id: reviewId,
      });

      if (!error) {
        setIsLiked(!!data);
      }
    }

    checkLikeStatus();
  }, [reviewId, userId, supabase]);

  const toggleLike = async () => {
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
        }
      } else {
        // Like
        const { error } = await supabase.from('review_likes').insert({
          user_id: userId,
          review_id: reviewId,
        });

        if (!error) {
          setIsLiked(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    isLoading,
    toggleLike,
  };
}
