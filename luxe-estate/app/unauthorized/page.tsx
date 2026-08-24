'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { useTranslation } from '@/components/providers';

export default function UnauthorizedPage() {
  const { userEmail, signOut } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleSwitchAccount = async () => {
    await signOut();
    router.push('/login?next=/admin');
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Shield Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/5">
          <svg
            className="w-10 h-10 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714zm0 13.036h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Status code & title */}
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 rounded-full mb-3">
          403 Forbidden
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl mb-3">
          Administrator Access Required
        </h1>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
          {userEmail ? (
            <>
              You are signed in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">{userEmail}</span>, but your account does not have administrator privileges to view the dashboard.
            </>
          ) : (
            'You do not have the required administrative permissions to view the dashboard.'
          )}
        </p>

        {/* Info box */}
        <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 text-left mb-8 space-y-1.5">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">Need access?</p>
          <p>
            Please contact an existing administrator to promote your account role in the Admin Dashboard, or use the setup CLI script:
          </p>
          <code className="block p-2 rounded bg-neutral-200/70 dark:bg-black/40 text-neutral-800 dark:text-neutral-200 font-mono text-[11px] overflow-x-auto">
            npm run db:set-admin {userEmail || 'your-email@example.com'} admin
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#006655] hover:bg-[#005544] dark:bg-[#006655] dark:hover:bg-[#007766] transition-colors shadow-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Homepage
          </Link>

          <button
            type="button"
            onClick={handleSwitchAccount}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>
    </main>
  );
}
