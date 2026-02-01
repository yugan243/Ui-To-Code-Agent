/**
 * Root Page - Main Dashboard (UICodeGenerator)
 * 
 * This is a protected route that shows the main UI Forge workspace
 * Users must be logged in to access this page (enforced by middleware)
 */

import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';
import UICodeGenerator from '@/components/UICodeGenerator';

export default async function HomePage() {
  // Check if user is authenticated
  const session = await auth();

  // Redirect to login if not authenticated (double-check even though middleware handles this)
  if (!session) {
    redirect('/login');
  }

  return <UICodeGenerator />;
}