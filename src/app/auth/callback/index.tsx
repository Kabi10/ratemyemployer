'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const requestUrl = new URL(window.location.href);
      const code = requestUrl.searchParams.get('code');
      const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

      if (code) {
        const supabase = createRouteHandlerClient({ cookies });
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code for session:', error);
          router.push('/auth/error');
          return;
        }
      }

      // Check if we already have a session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        console.log('Already have a valid session, redirecting to home');
        router.push('/');
        return;
      }
    };

    handleAuthCallback();
  }, [router]);

  return <div>Loading...</div>;
} 