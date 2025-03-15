import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Role } from '@/types';

/**
 * src/middleware.ts
 * Next.js middleware for route protection and authentication
 * Handles route protection and role-based access using Supabase user metadata
 */

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get user role from session
  const userRole = session?.user?.user_metadata?.role as Role || 'user';

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/api/protected',
    '/reviews/new',
    '/reviews/edit',
    '/companies/new',
    '/companies/edit',
  ];

  // Routes that require specific roles
  const roleRestrictedPaths = [
    { path: '/admin', requiredRole: 'admin' as Role },
    { path: '/admin/users', requiredRole: 'admin' as Role },
    { path: '/admin/reviews', requiredRole: 'moderator' as Role },
    { path: '/admin/companies', requiredRole: 'moderator' as Role },
    { path: '/admin/analytics', requiredRole: 'admin' as Role },
    { path: '/admin/settings', requiredRole: 'admin' as Role },
    { path: '/admin/background-check', requiredRole: 'admin' as Role },
  ];
  
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  // Find if current path requires a specific role
  const roleRestriction = roleRestrictedPaths.find(({ path }) => 
    req.nextUrl.pathname.startsWith(path)
  );

  // Check authentication for protected routes
  if (isProtectedPath) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check role restrictions if applicable
    if (roleRestriction) {
      const hasRequiredRole = hasRole(userRole, roleRestriction.requiredRole);
      
      if (!hasRequiredRole) {
        // Redirect to permission denied page
        return NextResponse.redirect(new URL('/permission-denied', req.url));
      }
    }
  }

  return res;
}

// Helper function to check if a user role meets the required role
function hasRole(userRole: Role, requiredRole: Role): boolean {
  switch (requiredRole) {
    case 'admin':
      return userRole === 'admin';
    case 'moderator':
      return userRole === 'moderator' || userRole === 'admin';
    case 'user':
      return true; // All authenticated users have at least 'user' role
    default:
      return false;
  }
}

export const config = {
  matcher: [
    '/reviews/new/:path*',
    '/reviews/edit/:path*',
    '/profile/:path*',
    '/account/:path*',
    '/companies/new/:path*',
    '/companies/edit/:path*',
    '/admin/:path*'
  ],
};