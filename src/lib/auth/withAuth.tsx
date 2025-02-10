'use client';

import * as React from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface WithAuthProps {
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { user, isLoading, isAdmin } = useAuth();
    const { requiredRole = 'user', redirectTo = '/auth/login' } = options;

    React.useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push(redirectTo);
        } else if (requiredRole === 'admin' && !isAdmin) {
          router.push('/');
        }
      }
    }, [user, isLoading, isAdmin, router, redirectTo, requiredRole]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!user || (requiredRole === 'admin' && !isAdmin)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
