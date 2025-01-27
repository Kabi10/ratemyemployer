'use client'

import * as React from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { Role } from '@/types';

interface WithAuthProps {
  requiredRole?: string;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: { requiredRole?: string } = {}
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    React.useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      }
    }, [user, isLoading, router]);

    if (isLoading) return <LoadingSpinner />;
    
    return user ? <WrappedComponent {...props} /> : null;
  };
}