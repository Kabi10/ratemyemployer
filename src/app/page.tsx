'use client';

// React and Next.js imports
import * as React from 'react';
import Link from 'next/link';
// Components and utilities
import { HomeClient } from '../components/HomeClient'; // Updated import path
import { SearchBar } from '../components/SearchBar';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[400px] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center space-y-6 sm:space-y-8 md:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight font-extrabold">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Rate My Employer
                </span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-4"
              >
                Share your work experience anonymously
              </motion.p>
            </motion.div>

            {/* Search Bar with proper centering */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <SearchBar />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rest of page content */}
    </div>
  );
}
