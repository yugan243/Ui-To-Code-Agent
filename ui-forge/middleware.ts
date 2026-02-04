/**
 * Next.js Middleware for Route Protection
 * 
 * Lightweight middleware that checks for session token cookie
 * without importing the full auth library (keeps bundle under 1MB)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for NextAuth session token (works for both dev and prod)
  const token = req.cookies.get("authjs.session-token") || 
                req.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!token;

  // Debug logging
  console.log('[Middleware]', { pathname, isLoggedIn });

  // Public routes (accessible without login)
  const isPublicRoute = pathname === '/login';

  // If user is logged in and tries to access login, redirect to home
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is NOT logged in and tries to access protected route, redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

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
