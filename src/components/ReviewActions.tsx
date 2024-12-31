'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function ReviewActions({
  reviewId,
  initialLikes,
}: {
  reviewId: string;
  initialLikes: number;
}) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchLikeStatus() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('review_likes')
          .select('liked')
          .eq('review_id', reviewId)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows found
          console.error('Error fetching like status:', error);
          return;
        }

        setIsLiked(data?.liked ?? false);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    }

    fetchLikeStatus();
  }, [user, reviewId]);

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like reviews');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('review_likes').upsert([
        {
          review_id: reviewId,
          user_id: user.id,
          liked: !isLiked,
        },
      ]);

      if (error) throw error;

      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
        isLiked ? 'bg-blue-500 text-white' : 'bg-gray-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span>{isLiked ? 'Liked' : 'Like'}</span>
      <span>{likes}</span>
    </button>
  );
}
