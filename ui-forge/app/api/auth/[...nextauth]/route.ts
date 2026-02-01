/**
 * NextAuth.js API Route Handler
 * 
 * This catch-all route handles all authentication requests:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out
 * - /api/auth/callback/[provider] - OAuth callbacks
 * - /api/auth/session - Get session data
 * - /api/auth/csrf - CSRF token
 * 
 * The [...nextauth] folder structure creates a catch-all route
 * that matches /api/auth/* paths
 */

import { handlers } from "@/libs/auth";

// Export GET and POST handlers from NextAuth config
export const { GET, POST } = handlers;
