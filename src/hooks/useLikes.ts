import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { ReviewLike } from '@/types/database';

export function useLikes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleLike = async (reviewId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if the like already exists
      const { data: existingLike, error: selectError } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116: Row not found
        throw selectError;
      }

      if (existingLike) {
        // Toggle the existing like
        const { data, error: updateError } = await supabase
          .from('review_likes')
          .update({ liked: !existingLike.liked })
          .eq('review_id', reviewId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) throw updateError;
        return data as ReviewLike;
      } else {
        // Create a new like
        const { data, error: insertError } = await supabase
          .from('review_likes')
          .insert([{ review_id: reviewId, user_id: userId, liked: true }])
          .select()
          .single();

        if (insertError) throw insertError;
        return data as ReviewLike;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle like'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleLike,
    loading,
    error,
  };
}
