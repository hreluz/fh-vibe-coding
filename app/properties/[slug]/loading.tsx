import React from 'react';
import { Navbar } from '@/components/layout';

export default function LoadingPropertyDetailPage() {
  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-64 bg-black/5 dark:bg-white/5 rounded animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Gallery Skeleton (col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-[16/10] rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-40 sm:w-48 aspect-[4/3] rounded-xl bg-black/5 dark:bg-white/5 animate-pulse flex-none"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#162e2a] p-6 rounded-2xl shadow-sm border border-[#006655]/10 dark:border-white/10 space-y-4 animate-pulse">
              <div className="h-10 w-48 bg-black/5 dark:bg-white/5 rounded" />
              <div className="h-4 w-36 bg-black/5 dark:bg-white/5 rounded" />
              <div className="h-px bg-slate-100 dark:bg-white/10 my-4" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-black/5 dark:bg-white/5 rounded" />
                  <div className="h-3 w-20 bg-black/5 dark:bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-xl mt-4" />
              <div className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-xl" />
            </div>

            {/* Map Skeleton */}
            <div className="bg-white dark:bg-[#162e2a] p-3 rounded-2xl border border-[#006655]/10 dark:border-white/10">
              <div className="aspect-[4/3] rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
            </div>
          </div>

          {/* Features Skeleton */}
          <div className="lg:col-span-8 lg:row-start-2 space-y-8">
            <div className="bg-white dark:bg-[#162e2a] p-6 sm:p-8 rounded-2xl border border-[#006655]/10 dark:border-white/10 animate-pulse">
              <div className="h-6 w-40 bg-black/5 dark:bg-white/5 rounded mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-black/5 dark:bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
