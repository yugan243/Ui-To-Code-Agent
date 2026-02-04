/**
 * Dashboard Page
 * 
 * Protected route - only accessible to authenticated users
 * Shows user info and placeholder for projects
 */

import { auth } from '@/libs/auth';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth-actions';

export default async function DashboardPage() {
  // Get session on server side
  const session = await auth();

  // This should not happen due to middleware, but just in case
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold font-syne mb-2">
              Welcome back, {session.user.name || 'User'}! 👋
            </h1>
            <p className="text-white/50">
              {session.user.email}
            </p>
          </div>

          {/* Logout Button */}
          <form action={logout}>
            <button
              type="submit"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 font-semibold"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Success Card */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-syne text-green-400 mb-1">
                🎉 Authentication Setup Complete!
              </h2>
              <p className="text-white/70">
                You are now logged in and this route is protected by middleware.
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="font-syne font-bold text-xl mb-2">Projects</h3>
            <p className="text-white/50 text-sm">Coming soon - create and manage your UI projects</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-syne font-bold text-xl mb-2">AI Code Gen</h3>
            <p className="text-white/50 text-sm">Upload screenshots to generate code</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-syne font-bold text-xl mb-2">Versions</h3>
            <p className="text-white/50 text-sm">Track every code iteration automatically</p>
          </div>
        </div>

        {/* Session Debug Info */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-syne font-bold text-lg mb-4">Session Info (Debug)</h3>
          <pre className="text-xs text-white/70 overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
