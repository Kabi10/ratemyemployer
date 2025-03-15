'use client'

import * as React from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Role } from '@/types';

interface WithAuthProps {
  requiredRole?: Role;
  redirectTo?: string;
}

// Permission Denied component for better UI feedback
const PermissionDenied = () => {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-red-700">Permission Denied</CardTitle>
          </div>
          <CardDescription>
            You don't have the required permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-600">
            This area is restricted to users with higher permission levels. If you believe you should have access, please contact an administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            Go to Home
          </Button>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { requiredRole, redirectTo = '/login' } = options;
  
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { user, isLoading, getUserRole } = useAuth();
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);

    React.useEffect(() => {
      if (!isLoading) {
        // Check if user is authenticated
        if (!user) {
          router.push(redirectTo);
          return;
        }
        
        // Check if role is required and user has the required role
        if (requiredRole) {
          const userRole = getUserRole();
          const hasRequiredRole = userRole === requiredRole || 
            (requiredRole === 'moderator' && userRole === 'admin') || 
            (requiredRole === 'user' && ['admin', 'moderator'].includes(userRole));
          
          setHasPermission(hasRequiredRole);
        } else {
          setHasPermission(true);
        }
      }
    }, [user, isLoading, router, requiredRole, getUserRole, redirectTo]);

    if (isLoading || hasPermission === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }
    
    if (!hasPermission) {
      return <PermissionDenied />;
    }
    
    return <WrappedComponent {...props} />;
  };
}