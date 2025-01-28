'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const supabase = createClient();
    
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        
        // Get the session from URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found, user is authenticated');
          router.push('/dashboard');
          return;
        }

        // If no session, listen for auth changes
        console.log('No session found, listening for auth state changes...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event, !!session);
          if (event === 'SIGNED_IN' && session) {
            router.push('/dashboard');
          }
        });

        return () => {
          console.log('Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Auth error:', e);
        setError(e instanceof Error ? e.message : 'An error occurred during authentication');
        // Redirect to sign-in page after a delay if there's an error
        setTimeout(() => router.push('/auth/signin'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">You will be redirected automatically...</p>
      </div>
    </div>
  );
} 