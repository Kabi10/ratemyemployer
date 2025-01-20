'use client'


import { JSX } from 'react';
import { useState, useEffect } from 'react';

import { redirect, useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabaseClient';
import { formatDateDisplay } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import type { Database } from '@/types/supabase';

type ReviewWithCompany = Database['public']['Tables']['reviews']['Row'] & {
  company: Database['public']['Tables']['companies']['Row'] | null;
};

export default function AccountPage(): JSX.Element {
  const { user, signOut } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [_isDeleting, setIsDeleting] = useState(false);

  const _handleDeleteReview = async (reviewId: string): Promise<void> => {
    if (!user || !window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id); // Extra safety check

      if (error) throw error;
      
      // Update local state
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect((): void => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async (): Promise<void> => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('reviews')
          .select('*, company:companies(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  const handleSignOut = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to sign out? This action cannot be undone.')) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        redirect('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <p className="text-center text-gray-600 dark:text-gray-400">Please log in to view your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">My Account</h1>
        <AccountContent />
      </div>
    </div>
  );
}

function AccountContent(): JSX.Element {
  const handleDeleteAccount = async (): Promise<void> => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        redirect('/');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
        <div className="space-y-4">
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  );
}