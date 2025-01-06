import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewLikes {
  [reviewId: string]: boolean;
}

export function useLikes(reviewId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user) return;

      const { data: likes } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', parseInt(reviewId, 10))
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!likes?.liked);
    };

    fetchLikes();
  }, [reviewId, user]);

  const toggleLike = async () => {
    if (!user) return;

    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikesCount(prev => prev + (newLikeState ? 1 : -1));

    const { error } = await supabase
      .from('review_likes')
      .upsert({
        review_id: parseInt(reviewId, 10),
        user_id: user.id,
        liked: newLikeState,
      });

    if (error) {
      // Revert optimistic update on error
      setIsLiked(!newLikeState);
      setLikesCount(prev => prev + (!newLikeState ? 1 : -1));
      console.error('Error toggling like:', error);
    }
  };

  return { isLiked, likesCount, toggleLike };
}
