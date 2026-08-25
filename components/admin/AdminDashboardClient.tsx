'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PaginatedUsersResult, AdminDashboardStats } from '@/lib/services/roles';
import { PaginatedPropertiesResult } from '@/lib/services/properties';
import { AdminStatsCards } from './AdminStatsCards';
import { PropertiesTable, AdminPropertiesFilters } from './PropertiesTable';
import { UsersTable, AdminUsersFilters } from './UsersTable';

interface AdminDashboardClientProps {
  propertiesResult: PaginatedPropertiesResult;
  usersResult: PaginatedUsersResult;
  initialStats: AdminDashboardStats;
  currentUserId: string | null;
  initialTab?: TabType;
  initialPropertyFilters: AdminPropertiesFilters;
  initialUserFilters: AdminUsersFilters;
}

export type TabType = 'properties' | 'users';

export function AdminDashboardClient({
  propertiesResult,
  usersResult,
  initialStats,
  currentUserId,
  initialTab = 'properties',
  initialPropertyFilters,
  initialUserFilters,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const activeTab: TabType = initialTab;
  const [stats, setStats] = useState<AdminDashboardStats>(initialStats);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    const currentPageSize = searchParams.get('pageSize');
    if (currentPageSize && currentPageSize !== '10') {
      params.set('pageSize', currentPageSize);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const refreshStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to refresh stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time control center for Luxe Estate listings and user role assignments.
          </p>
        </div>

        {/* Action Button & Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-2xl bg-[#006655] hover:bg-[#19322F] dark:bg-[#06f9d0] dark:text-neutral-950 dark:hover:bg-[#006655] dark:hover:text-white text-white shadow-xs transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Property</span>
          </Link>

          <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => handleTabChange('properties')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties Portfolio</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                {stats.totalProperties}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('users')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>User Roles</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                {stats.totalUsers}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <AdminStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Main Tab Content */}
      {activeTab === 'properties' ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Current Properties Listings
            </h2>
            <span className="text-xs text-neutral-500">
              Toggle the switch to instantly feature or un-feature a property.
            </span>
          </div>
          <PropertiesTable
            propertiesResult={propertiesResult}
            filters={initialPropertyFilters}
            onStatsRefresh={refreshStats}
          />
        </section>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Authenticated User Roles
            </h2>
            <span className="text-xs text-neutral-500">
              Manage permissions by assigning &quot;Admin&quot; or &quot;User&quot; roles.
            </span>
          </div>
          <UsersTable
            usersResult={usersResult}
            filters={initialUserFilters}
            currentUserId={currentUserId}
            onStatsRefresh={refreshStats}
          />
        </section>
      )}
    </div>
  );
}
