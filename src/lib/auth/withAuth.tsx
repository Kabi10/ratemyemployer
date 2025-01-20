'use client'


import { useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { Role } from '@/types';

interface WithAuthProps {
  requiredRole?: Role;
  redirectTo?: string;
}

export function withAuth(
  WrappedComponent: React.ComponentType<any>,
  { requiredRole, redirectTo = '/auth/login' }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: any) {
    const { user, isLoading } = useAuth();
    const router = redirect();
    const roleRef = useRef(requiredRole);

    useEffect(() => {
      if (!isLoading && !user) {
        router.push(redirectTo);
      } else if (roleRef.current && user?.role !== roleRef.current) {
        router.push('/unauthorized');
      }
    }, [isLoading, user, router, redirectTo]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}