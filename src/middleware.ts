import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


import { createServerClient, type CookieOptions } from '@supabase/ssr';

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

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/api/protected',
  ];

  // Routes that require admin role
  const adminPaths = [
    '/admin/users',
    '/admin/reviews',
    '/admin/companies',
    '/admin/analytics'
  ];
  
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // Check authentication for protected routes
  if (isProtectedPath || isAdminPath) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Check admin role for admin routes
    if (isAdminPath && session.user.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
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