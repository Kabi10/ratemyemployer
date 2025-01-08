"use strict";
/**
 * src/middleware.ts
 * Next.js middleware for route protection and authentication
 * Handles route protection and role-based access using Supabase user metadata
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.middleware = void 0;
const ssr_1 = require("@supabase/ssr");
const server_1 = require("next/server");
async function middleware(req) {
    var _a;
    const res = server_1.NextResponse.next();
    const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(name) {
                var _a;
                return (_a = req.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            set(name, value, options) {
                res.cookies.set(Object.assign({ name,
                    value }, options));
            },
            remove(name, options) {
                res.cookies.set(Object.assign({ name, value: '' }, options));
            },
        },
    });
    const { data: { session }, } = await supabase.auth.getSession();
    // Protected routes that require authentication
    const protectedPaths = [
        '/reviews/new',
        '/reviews/edit',
        '/profile',
        '/account',
        '/companies/new',
        '/companies/edit'
    ];
    // Routes that require admin role
    const adminPaths = [
        '/admin',
        '/admin/users',
        '/admin/reviews',
        '/admin/companies',
        '/admin/analytics'
    ];
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
    const isAdminPath = adminPaths.some(path => req.nextUrl.pathname.startsWith(path));
    // Check authentication for protected routes
    if (!session) {
        if (isProtectedPath || isAdminPath) {
            const redirectUrl = new URL('/auth/login', req.url);
            redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
            return server_1.NextResponse.redirect(redirectUrl);
        }
    }
    // Check admin role in user metadata for admin routes
    else if (isAdminPath && ((_a = session.user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        return server_1.NextResponse.redirect(new URL('/', req.url));
    }
    return res;
}
exports.middleware = middleware;
exports.config = {
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
