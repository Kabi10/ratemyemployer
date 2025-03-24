import { createMocks } from 'node-mocks-http';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';
import { createServerClient } from '@supabase/ssr';
import { Role } from '@/types';

// Mock Supabase client
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
    },
  })),
}));

describe('Middleware', () => {
  let mockReq: NextRequest;
  let mockRes: NextResponse;

  beforeEach(() => {
    const { req, res } = createMocks();
    mockReq = req as unknown as NextRequest;
    mockRes = res as unknown as NextResponse;
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock NextResponse.next
    vi.spyOn(NextResponse, 'next').mockImplementation(() => mockRes);
    
    // Mock NextResponse.redirect
    vi.spyOn(NextResponse, 'redirect').mockImplementation(() => mockRes);
  });

  describe('Protected Routes', () => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/reviews/new',
      '/companies/new',
    ];

    test.each(protectedRoutes)('redirects to login for unauthenticated access to %s', async (route) => {
      // Mock unauthenticated session
      (createServerClient as jest.Mock).mockImplementation(() => ({
        auth: {
          getSession: () => ({ data: { session: null } }),
        },
      }));

      // Mock request to protected route
      mockReq.nextUrl = new URL(`http://localhost${route}`);
      
      await middleware(mockReq);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login')
      );
    });

    test.each(protectedRoutes)('allows authenticated access to %s', async (route) => {
      // Mock authenticated session
      (createServerClient as jest.Mock).mockImplementation(() => ({
        auth: {
          getSession: () => ({
            data: {
              session: {
                user: { id: '123', email: 'test@example.com', user_metadata: { role: 'user' } },
              },
            },
          }),
        },
      }));

      // Mock request to protected route
      mockReq.nextUrl = new URL(`http://localhost${route}`);
      
      await middleware(mockReq);
      
      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Role-Based Access', () => {
    const roleRestrictedRoutes = [
      { path: '/admin', role: 'admin' as Role },
      { path: '/admin/users', role: 'admin' as Role },
      { path: '/admin/reviews', role: 'moderator' as Role },
      { path: '/admin/companies', role: 'moderator' as Role },
    ];

    test.each(roleRestrictedRoutes)(
      'restricts access to $path for users without $role role',
      async ({ path, role }) => {
        // Mock authenticated session with insufficient role
        (createServerClient as jest.Mock).mockImplementation(() => ({
          auth: {
            getSession: () => ({
              data: {
                session: {
                  user: { id: '123', email: 'test@example.com', user_metadata: { role: 'user' } },
                },
              },
            }),
          }),
        }));

        // Mock request to role-restricted route
        mockReq.nextUrl = new URL(`http://localhost${path}`);
        
        await middleware(mockReq);
        
        expect(NextResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('/permission-denied')
        );
      }
    );

    test.each(roleRestrictedRoutes)(
      'allows access to $path for users with $role role',
      async ({ path, role }) => {
        // Mock authenticated session with sufficient role
        (createServerClient as jest.Mock).mockImplementation(() => ({
          auth: {
            getSession: () => ({
              data: {
                session: {
                  user: { id: '123', email: 'test@example.com', user_metadata: { role } },
                },
              },
            }),
          }),
        }));

        // Mock request to role-restricted route
        mockReq.nextUrl = new URL(`http://localhost${path}`);
        
        await middleware(mockReq);
        
        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      }
    );
  });

  describe('Role Hierarchy', () => {
    test('allows admin access to moderator routes', async () => {
      // Mock authenticated session with admin role
      (createServerClient as jest.Mock).mockImplementation(() => ({
        auth: {
          getSession: () => ({
            data: {
              session: {
                user: { id: '123', email: 'test@example.com', user_metadata: { role: 'admin' } },
              },
            },
          }),
        },
      }));

      // Mock request to moderator route
      mockReq.nextUrl = new URL('http://localhost/admin/reviews');
      
      await middleware(mockReq);
      
      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    test('prevents moderator access to admin routes', async () => {
      // Mock authenticated session with moderator role
      (createServerClient as jest.Mock).mockImplementation(() => ({
        auth: {
          getSession: () => ({
            data: {
              session: {
                user: { id: '123', email: 'test@example.com', user_metadata: { role: 'moderator' } },
              },
            },
          }),
        },
      }));

      // Mock request to admin route
      mockReq.nextUrl = new URL('http://localhost/admin/users');
      
      await middleware(mockReq);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/permission-denied')
      );
    });
  });

  describe('Public Routes', () => {
    const publicRoutes = ['/', '/about', '/companies', '/reviews'];

    test.each(publicRoutes)(
      'allows unauthenticated access to %s',
      async (route) => {
        // Mock unauthenticated session
        (createServerClient as jest.Mock).mockImplementation(() => ({
          auth: {
            getSession: () => ({ data: { session: null } }),
          },
        }));

        // Mock request to public route
        mockReq.nextUrl = new URL(`http://localhost${route}`);
        
        await middleware(mockReq);
        
        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
      }
    );
  });
}); 