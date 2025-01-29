'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First check if we already have a session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('Already have a valid session, redirecting to home');
          router.push('/');
          return;
        }

        // Check for error in URL
        const error = new URLSearchParams(window.location.search).get('error');
        if (error) {
          console.error('Auth provider error:', error);
          throw new Error(`Auth provider error: ${error}`);
        }

        // Get code from URL
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          console.error('No code found in URL:', window.location.search);
          throw new Error('Authorization code missing');
        }

        // Exchange code for session
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
          console.error('Session exchange error:', sessionError);
          throw sessionError;
        }

        // Verify we got a session
        if (!data.session) {
          throw new Error('No session returned from code exchange');
        }

        console.log('Successfully authenticated, redirecting to home');
        router.push('/');
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
} 