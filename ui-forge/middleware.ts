/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware runs on EVERY request and:
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to login
 * - Redirects authenticated users away from login page
 * 
 * Matcher config ensures it only runs on specific routes
 */

import { auth } from "@/libs/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Debug logging
  console.log('[Middleware]', { pathname, isLoggedIn, hasAuth: !!req.auth });

  // Public routes (accessible without login) - only login page
  const isPublicRoute = pathname === '/login';

  // If user is logged in and tries to access login, redirect to home
  if (isLoggedIn && pathname === '/login') {
    console.log('[Middleware] Logged in user accessing /login, redirecting to /');
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is NOT logged in and tries to access protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    console.log('[Middleware] Not logged in, redirecting to /login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

// Config: Define which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
