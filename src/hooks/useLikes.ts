import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

interface ReviewLike {
  review_id: string;
  user_id: string;
  liked: boolean;
}

export function useLikes() {
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  async function fetchLikes(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('review_likes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching likes:', error);
      return;
    }

    const likesMap = data.reduce((acc, like) => {
      acc[like.review_id] = like.liked;
      return acc;
    }, {} as Record<string, boolean>);

    setLikes(likesMap);
  }

  async function toggleLike(reviewId: string, userId: string) {
    const supabase = createClient();
    const currentLiked = likes[reviewId];
    const newLiked = !currentLiked;

    // Optimistically update UI
    setLikes(prev => ({ ...prev, [reviewId]: newLiked }));

    const { error } = await supabase
      .from('review_likes')
      .upsert([
        {
          review_id: reviewId,
          user_id: userId,
          liked: newLiked,
        },
      ]);

    if (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLikes(prev => ({ ...prev, [reviewId]: currentLiked }));
    }
  }

  return { likes, fetchLikes, toggleLike };
}
