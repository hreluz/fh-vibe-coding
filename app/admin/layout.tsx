import React from 'react';
import Link from 'next/link';
import { getCurrentUserRole } from '@/lib/services/roles';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | Luxe Estate',
  description: 'Manage property listings and user permissions across Luxe Estate.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getCurrentUserRole();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-neutral-900 dark:text-white group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#006655] dark:bg-[#06f9d0] flex items-center justify-center text-white dark:text-neutral-950 font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                  LE
                </div>
                <span>
                  Luxe<span className="text-[#006655] dark:text-[#06f9d0]">Estate</span>
                </span>
              </Link>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Portal
              </span>
            </div>

            {/* Right Side Info & Return to Store Link */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Signed in as</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {user?.fullName || user?.email}
                </span>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Live Store</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
