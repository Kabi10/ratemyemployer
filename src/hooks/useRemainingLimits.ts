import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface RemainingLimits {
  remaining_reviews: number;
  remaining_companies: number;
  reset_in_hours: number;
}

/**
 * Custom hook to get the remaining submission limits for the current user
 * @returns Object containing remaining limits and loading state
 */
export function useRemainingLimits() {
  const { user } = useAuth();
  const [remainingLimits, setRemainingLimits] = useState<RemainingLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRemainingLimits = async () => {
    if (!user) {
      setRemainingLimits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_remaining_limits', { user_id: user.id });

      if (error) {
        console.error('Error fetching remaining limits:', error);
        setError(error.message);
        return;
      }

      setRemainingLimits(data as RemainingLimits);
      setError(null);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemainingLimits();
  }, [user]);

  return {
    remainingLimits,
    loading,
    error,
    refetch: fetchRemainingLimits
  };
} 