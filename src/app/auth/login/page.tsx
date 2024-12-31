'use client';

import Auth from '@/components/Auth';
import { AuthButtons } from '@/components/AuthButtons';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Welcome Back</h1>
        <Auth />
        <div className="mt-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <AuthButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
