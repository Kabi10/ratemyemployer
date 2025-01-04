'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
      }
    }, [user, isLoading, router, requiredRole]);

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