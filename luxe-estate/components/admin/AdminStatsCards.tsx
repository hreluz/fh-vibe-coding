'use client';

import React from 'react';
import { AdminDashboardStats } from '@/lib/services/roles';

interface AdminStatsCardsProps {
  stats: AdminDashboardStats | null;
  isLoading: boolean;
}

export function AdminStatsCards({ stats, isLoading }: AdminStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties ?? 0,
      subtext: `${stats?.forSaleCount ?? 0} for sale • ${stats?.forRentCount ?? 0} for rent`,
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Featured Listings',
      value: stats?.featuredCount ?? 0,
      subtext: `${Math.round(((stats?.featuredCount ?? 0) / Math.max(stats?.totalProperties ?? 1, 1)) * 100)}% of total portfolio`,
      icon: (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Average Price',
      value: formatCurrency(stats?.averagePrice ?? 0),
      subtext: 'Across active listings',
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Authenticated Users',
      value: stats?.totalUsers ?? 0,
      subtext: `${stats?.adminCount ?? 0} Administrators • ${stats?.userCount ?? 0} Standard Users`,
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`p-2.5 rounded-xl ${card.iconBg}`}>{card.icon}</div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
