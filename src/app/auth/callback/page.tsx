'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) throw new Error('Authorization code missing');

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

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