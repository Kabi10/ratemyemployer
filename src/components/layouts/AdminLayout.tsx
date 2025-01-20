'use client'

import { ReactNode } from 'react';
import Link from 'next/link';
import { withAuth } from '@/lib/auth/withAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutBase({ children }: AdminLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-800 dark:text-white">
                  Admin Dashboard
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/admin" className="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
                  Overview
                </Link>
                <Link href="/admin/users" className="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
                  Users
                </Link>
                <Link href="/admin/analytics" className="text-gray-900 dark:text-gray-100 hover:text-gray-500 dark:hover:text-gray-400 px-3 py-2 rounded-md text-sm font-medium">
                  Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export const AdminLayout = withAuth(AdminLayoutBase);