'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get('error') : null;

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-4">
          There was an issue during authentication. Please try again.
        </p>
        {error && (
          <p className="text-sm text-gray-500">
            Error details: {error}
          </p>
        )}
        <a 
          href="/auth/signin" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Return to Sign In
        </a>
      </div>
    </div>
  );
} 