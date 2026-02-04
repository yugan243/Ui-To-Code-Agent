/**
 * Session Provider Wrapper
 * 
 * This component wraps the app to provide session context
 * Must be a Client Component because SessionProvider uses React Context
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
