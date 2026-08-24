'use client';

import React, { useState, useMemo } from 'react';
import { UserRoleRow, UserRole } from '@/types/database';
import { useAuth } from '@/components/providers';

interface UsersTableProps {
  initialUsers: UserRoleRow[];
  currentUserId: string | null;
  onStatsRefresh?: () => void;
}

export function UsersTable({ initialUsers, currentUserId, onStatsRefresh }: UsersTableProps) {
  const { user: authUser, refreshRole } = useAuth();
  const [users, setUsers] = useState<UserRoleRow[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refresh users list');
      }
      setUsers(data.users || []);
      showToast('User list refreshed successfully', 'success');
      if (onStatsRefresh) onStatsRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh users';
      showToast(msg, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRoleChange = async (targetUser: UserRoleRow, newRole: UserRole) => {
    if (targetUser.role === newRole) return;

    const isSelf = targetUser.user_id === currentUserId || targetUser.user_id === authUser?.id;
    if (isSelf && newRole !== 'admin') {
      showToast('You cannot demote your own account to prevent accidental lockout.', 'error');
      return;
    }

    const previousRole = targetUser.role;

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );
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
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: previousRole } : u))
      );
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      showToast(msg, 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesName = (u.full_name || '').toLowerCase().includes(q);
        if (!matchesEmail && !matchesName) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter]);

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

      {/* Controls: Search, Filter, Refresh */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
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
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#006655] dark:focus:ring-[#06f9d0] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Refresh */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Standard Users Only</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              {filteredUsers.length} Users
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th scope="col" className="py-3.5 pl-5 pr-3">User</th>
                <th scope="col" className="px-3 py-3.5">Email</th>
                <th scope="col" className="px-3 py-3.5">Assigned Role</th>
                <th scope="col" className="px-3 py-3.5">Registered</th>
                <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                    <div className="max-w-xs mx-auto">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your search criteria or register a new user.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.user_id === currentUserId || u.user_id === authUser?.id;
                  const isUpdating = updatingUserId === u.id;
                  const initials = (u.full_name || u.email || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* User Avatar & Name */}
                      <td className="py-4 pl-5 pr-3 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden bg-[#006655]/10 dark:bg-white/10 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.avatar_url}
                                alt={u.full_name || u.email}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-[#006655] dark:text-[#06f9d0]">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white truncate block text-sm">
                                {u.full_name || 'Anonymous User'}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#006655]/10 text-[#006655] dark:bg-[#06f9d0]/15 dark:text-[#06f9d0]">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400 font-mono block truncate">
                              ID: {u.user_id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3 py-4 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            Standard User
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="px-3 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Role Dropdown / Action */}
                      <td className="py-4 pl-3 pr-5 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-2">
                          <select
                            disabled={isUpdating || (isSelf && u.role === 'admin')}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 focus:ring-2 focus:ring-purple-500'
                                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-[#006655]'
                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''} ${
                              isSelf && u.role === 'admin' ? 'cursor-not-allowed opacity-80' : ''
                            }`}
                            title={
                              isSelf && u.role === 'admin'
                                ? 'Self-demotion is locked to prevent accidental lockout'
                                : 'Select role'
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
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
      </div>
    </div>
  );
}
