/**
 * Next.js Middleware - Route Protection
 *
 * Protects admin routes from unauthorized access.
 * Add ADMIN_API_KEY to your environment variables.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
  '/api/admin',
];

// Check if request path matches protected routes
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Get auth token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const authCookie = request.cookies.get('admin-token');

  const token = authHeader?.replace('Bearer ', '') || authCookie?.value;

  // Get expected admin key from environment
  const adminKey = process.env.ADMIN_API_KEY;

  // If no admin key is set in environment, allow access (local dev mode)
  // In production, ADMIN_API_KEY MUST be set
  if (!adminKey) {
    console.warn('⚠️  ADMIN_API_KEY not set - admin routes are UNPROTECTED');
    return NextResponse.next();
  }

  // Validate token
  if (!token || token !== adminKey) {
    // For API routes, return JSON error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing admin token' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token is valid, allow request
  return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
