'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          There was a problem signing you in. This could be due to:
        </p>
        
        <ul className="text-left text-gray-600 dark:text-gray-300 mb-8 list-disc pl-6">
          <li>An expired or invalid session</li>
          <li>Network connectivity issues</li>
          <li>Authentication service disruption</li>
        </ul>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 