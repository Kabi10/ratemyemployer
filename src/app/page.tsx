'use client';

// React and Next.js imports
import * as React from 'react';
import Link from 'next/link';

// Components and utilities
import { HomeClient } from '@/components/HomeClient';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="text-center space-y-12 sm:space-y-16 md:space-y-20">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight font-extrabold">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 leading-tight opacity-0 animate-fade-in-up [animation-delay:200ms]">
                Rate My Employer
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl mt-4 sm:mt-6 text-gray-600 dark:text-gray-300 opacity-0 animate-fade-in [animation-delay:400ms]">
                Share Your Work Experience
              </span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 dark:text-gray-300 opacity-0 animate-fade-in [animation-delay:600ms]">
              Help others make informed career decisions.
            </p>
          </div>
          <HomeClient />
        </div>
      </div>
    </div>
  );
}