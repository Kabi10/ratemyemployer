'use client';

import { Button } from '@/components/ui-library/button';
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-4 text-gray-600">
              You don't have permission to access this page. This area is restricted to administrators only.
            </p>
            <div className="mt-6 space-y-4">
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 