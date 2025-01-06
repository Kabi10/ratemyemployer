'use client';

import { withAuth } from '@/lib/auth/withAuth';
import * as React from 'react';
import Link from 'next/link';

type AdminLayoutProps = React.PropsWithChildren<{}>;

function BaseAdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/companies"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Companies
            </Link>
            <Link
              href="/admin/reviews"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Reviews
            </Link>
            <Link
              href="/admin/users"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Users
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

// Protect the admin layout for admin users
export const AdminLayout = withAuth(BaseAdminLayout, { requiredRole: 'admin' }); 