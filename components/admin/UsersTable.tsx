'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { UserRoleRow, UserRole } from '@/types/database';
import { PaginatedUsersResult } from '@/lib/services/roles';
import { useAuth } from '@/components/providers';
import { Pagination } from '@/components/ui';

export interface AdminUsersFilters {
  page: number;
  pageSize: number;
  query: string;
  role: 'all' | 'admin' | 'user';
}

interface UsersTableProps {
  usersResult: PaginatedUsersResult;
  filters: AdminUsersFilters;
  currentUserId: string | null;
  onStatsRefresh?: () => void;
}

export function UsersTable({
  usersResult,
  filters,
  currentUserId,
  onStatsRefresh,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: authUser, refreshRole } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [optimisticRoles, setOptimisticRoles] = useState<Record<string, UserRole>>({});
  const [prevQuery, setPrevQuery] = useState(filters.query);
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync search input with prop changes during render
  if (filters.query !== prevQuery) {
    setPrevQuery(filters.query);
    setSearchQuery(filters.query);
  }

  const users = usersResult.users.map((u) => {
    if (optimisticRoles[u.user_id] !== undefined) {
      return { ...u, role: optimisticRoles[u.user_id] };
    }
    return u;
  });

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const buildUrl = useCallback(
    (overrides: Partial<AdminUsersFilters>) => {
      const newFilters = {
        ...filters,
        ...overrides,
      };

      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'users');

      if (newFilters.page && newFilters.page > 1) {
        params.set('page', newFilters.page.toString());
      } else {
        params.delete('page');
      }

      if (newFilters.pageSize && newFilters.pageSize !== 10) {
        params.set('pageSize', newFilters.pageSize.toString());
      } else {
        params.delete('pageSize');
      }

      if (newFilters.query && newFilters.query.trim()) {
        params.set('query', newFilters.query.trim());
      } else {
        params.delete('query');
      }

      if (newFilters.role && newFilters.role !== 'all') {
        params.set('role', newFilters.role);
      } else {
        params.delete('role');
      }

      // Remove property-specific filters
      params.delete('category');
      params.delete('listingType');
      params.delete('featured');

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname, searchParams]
  );

  const applyFilters = useCallback(
    (overrides: Partial<AdminUsersFilters>) => {
      const nextUrl = buildUrl(overrides);
      startTransition(() => {
        router.push(nextUrl);
      });
    },
    [buildUrl, router]
  );

  // Debounced search query update
  React.useEffect(() => {
    if (searchQuery === filters.query) return;

    const timer = setTimeout(() => {
      applyFilters({ query: searchQuery, page: 1 });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.query, applyFilters]);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
    showToast('User list refreshed successfully', 'success');
    if (onStatsRefresh) onStatsRefresh();
  };

  const handleRoleChange = async (targetUser: UserRoleRow, newRole: UserRole) => {
    if (targetUser.role === newRole) return;

    const isSelf = targetUser.user_id === currentUserId || targetUser.user_id === authUser?.id;
    if (isSelf && newRole !== 'admin') {
      showToast('You cannot demote your own account to prevent accidental lockout.', 'error');
      return;
    }

    // Optimistic UI update
    setOptimisticRoles((prev) => ({ ...prev, [targetUser.user_id]: newRole }));
    setUpdatingUserId(targetUser.id);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUser.user_id,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      showToast(
        `Updated role for ${targetUser.email} to "${newRole.toUpperCase()}"`,
        'success'
      );

      if (isSelf) {
        await refreshRole();
      }

      if (onStatsRefresh) onStatsRefresh();
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setOptimisticRoles((prev) => {
        const next = { ...prev };
        delete next[targetUser.user_id];
        return next;
      });
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      showToast(msg, 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const startItem =
    usersResult.total === 0 ? 0 : (usersResult.page - 1) * usersResult.pageSize + 1;
  const endItem = Math.min(usersResult.page * usersResult.pageSize, usersResult.total);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border border-emerald-700'
              : 'bg-rose-900 text-rose-100 border border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Controls: Search, Filter, Page Size, Refresh */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#006655] dark:focus:ring-[#06f9d0] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  applyFilters({ query: '', page: 1 });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Page Size & Refresh Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => applyFilters({ role: e.target.value as 'all' | 'admin' | 'user', page: 1 })}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Standard Users Only</option>
            </select>

            {/* Page Size Select */}
            <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2 py-1">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 pl-1">Per page:</span>
              <select
                value={filters.pageSize}
                onChange={(e) => applyFilters({ pageSize: Number(e.target.value), page: 1 })}
                className="py-1 text-xs font-semibold bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value={10} className="bg-white dark:bg-neutral-800">10</option>
                <option value={25} className="bg-white dark:bg-neutral-800">25</option>
                <option value={50} className="bg-white dark:bg-neutral-800">50</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 ${isPending ? 'animate-spin text-[#006655] dark:text-[#06f9d0]' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Results count badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              {isPending && (
                <svg className="w-3.5 h-3.5 animate-spin text-[#006655] dark:text-[#06f9d0]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>
                {usersResult.total === 0
                  ? '0 Users'
                  : `${startItem}-${endItem} of ${usersResult.total} Users`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs relative">
        {/* Loading Progress Bar */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 overflow-hidden z-10">
            <div className="h-full bg-[#006655] dark:bg-[#06f9d0] animate-pulse w-full" />
          </div>
        )}

        <div className={`overflow-x-auto transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th scope="col" className="py-3.5 pl-5 pr-3">User</th>
                <th scope="col" className="px-3 py-3.5">Email</th>
                <th scope="col" className="px-3 py-3.5">Joined Date</th>
                <th scope="col" className="px-3 py-3.5">Current Role</th>
                <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                    <div className="max-w-xs mx-auto">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your search query or role filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((targetUser) => {
                  const isUpdating = updatingUserId === targetUser.id;
                  const isSelf =
                    targetUser.user_id === currentUserId || targetUser.user_id === authUser?.id;
                  const initials = (targetUser.full_name || targetUser.email)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={targetUser.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Avatar & Full Name */}
                      <td className="py-4 pl-5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-600 dark:text-neutral-300">
                            {targetUser.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={targetUser.avatar_url}
                                alt={targetUser.full_name || 'User avatar'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                              <span>{targetUser.full_name || 'Unnamed User'}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-400 font-mono mt-0.5">
                              ID: {targetUser.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3 py-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300 font-mono text-xs">
                        {targetUser.email}
                      </td>

                      {/* Registered Date */}
                      <td className="px-3 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(targetUser.created_at)}
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            targetUser.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              targetUser.role === 'admin' ? 'bg-purple-500' : 'bg-neutral-400'
                            }`}
                          />
                          <span className="capitalize">{targetUser.role}</span>
                        </span>
                      </td>

                      {/* Action: Role Switcher Dropdown */}
                      <td className="py-4 pl-3 pr-5 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-2">
                          {isUpdating && (
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
                          )}
                          <select
                            value={targetUser.role}
                            disabled={isUpdating || (isSelf && targetUser.role === 'admin')}
                            onChange={(e) =>
                              handleRoleChange(targetUser, e.target.value as UserRole)
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                              isSelf && targetUser.role === 'admin'
                                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 cursor-not-allowed'
                                : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-purple-500 dark:hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                            }`}
                            title={
                              isSelf && targetUser.role === 'admin'
                                ? 'Self-demotion disabled for security'
                                : undefined
                            }
                          >
                            <option value="user">User (Standard)</option>
                            <option value="admin">Admin (Full Access)</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        {usersResult.totalPages > 1 && (
          <div className="px-4 py-2 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <Pagination
              currentPage={usersResult.page}
              totalPages={usersResult.totalPages}
              totalItems={usersResult.total}
              pageSize={usersResult.pageSize}
              createPageUrl={(pageNum) => buildUrl({ page: pageNum })}
              onPageChange={(pageNum) => applyFilters({ page: pageNum })}
              className="py-3 border-t-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
