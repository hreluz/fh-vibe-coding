'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Property } from '@/types/property';
import { PaginatedPropertiesResult } from '@/lib/services/properties';
import { Pagination } from '@/components/ui';

export interface AdminPropertiesFilters {
  page: number;
  pageSize: number;
  query: string;
  category: string;
  listingType: string;
  featured: string;
  status: string;
}

interface PropertiesTableProps {
  propertiesResult: PaginatedPropertiesResult;
  filters: AdminPropertiesFilters;
  onStatsRefresh?: () => void;
}

export function PropertiesTable({
  propertiesResult,
  filters,
  onStatsRefresh,
}: PropertiesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [optimisticFeatured, setOptimisticFeatured] = useState<Record<string, boolean>>({});
  const [optimisticActive, setOptimisticActive] = useState<Record<string, boolean>>({});
  const [prevQuery, setPrevQuery] = useState(filters.query);
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Property | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Sync state with prop change during render
  if (filters.query !== prevQuery) {
    setPrevQuery(filters.query);
    setSearchQuery(filters.query);
  }

  const properties = propertiesResult.properties.map((p) => {
    let item = { ...p };
    if (optimisticFeatured[p.id] !== undefined) {
      item.isFeatured = optimisticFeatured[p.id];
    }
    if (optimisticActive[p.id] !== undefined) {
      item.isActive = optimisticActive[p.id];
    }
    return item;
  });

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const buildUrl = useCallback(
    (overrides: Partial<AdminPropertiesFilters>) => {
      const newFilters = {
        ...filters,
        ...overrides,
      };

      const params = new URLSearchParams(searchParams.toString());

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

      if (newFilters.category && newFilters.category !== 'all') {
        params.set('category', newFilters.category);
      } else {
        params.delete('category');
      }

      if (newFilters.listingType && newFilters.listingType !== 'all') {
        params.set('listingType', newFilters.listingType);
      } else {
        params.delete('listingType');
      }

      if (newFilters.featured && newFilters.featured !== 'all') {
        params.set('featured', newFilters.featured);
      } else {
        params.delete('featured');
      }

      if (newFilters.status && newFilters.status !== 'all') {
        params.set('status', newFilters.status);
      } else {
        params.delete('status');
      }

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname, searchParams]
  );

  const applyFilters = useCallback(
    (overrides: Partial<AdminPropertiesFilters>) => {
      const nextUrl = buildUrl(overrides);
      startTransition(() => {
        router.push(nextUrl);
      });
    },
    [buildUrl, router]
  );

  // Debounced search query update
  useEffect(() => {
    if (searchQuery === filters.query) return;

    const timer = setTimeout(() => {
      applyFilters({ query: searchQuery, page: 1 });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.query, applyFilters]);

  const handleToggleFeatured = async (property: Property) => {
    const nextState = !property.isFeatured;

    // Optimistic local update
    setOptimisticFeatured((prev) => ({ ...prev, [property.id]: nextState }));
    setUpdatingId(property.id);

    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFeatured: nextState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update property status');
      }

      showToast(
        `"${property.title}" is now ${nextState ? 'featured on the homepage' : 'set to standard'}`,
        'success'
      );
      if (onStatsRefresh) onStatsRefresh();
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setOptimisticFeatured((prev) => {
        const next = { ...prev };
        delete next[property.id];
        return next;
      });
      const msg = err instanceof Error ? err.message : 'Failed to update featured status';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReactivate = async (property: Property) => {
    setUpdatingId(property.id);
    setOptimisticActive((prev) => ({ ...prev, [property.id]: true }));

    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reactivate property');
      }

      showToast(`Property "${property.title}" is now active and visible publicly.`, 'success');
      if (onStatsRefresh) onStatsRefresh();
      startTransition(() => {
        router.refresh();
      });
    } catch (err: unknown) {
      setOptimisticActive((prev) => {
        const next = { ...prev };
        delete next[property.id];
        return next;
      });
      const msg = err instanceof Error ? err.message : 'Failed to reactivate property';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      const res = await fetch(`/api/admin/properties/${deactivateTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deactivate property');
      }

      showToast(`Property "${deactivateTarget.title}" was deactivated and hidden from public view.`, 'success');
      setDeactivateTarget(null);
      if (onStatsRefresh) onStatsRefresh();
      startTransition(() => {
        router.refresh();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate property';
      showToast(msg, 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const startItem =
    propertiesResult.total === 0 ? 0 : (propertiesResult.page - 1) * propertiesResult.pageSize + 1;
  const endItem = Math.min(
    propertiesResult.page * propertiesResult.pageSize,
    propertiesResult.total
  );

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

      {/* Control Bar: Filters, Search, Page Size & Results summary */}
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
              placeholder="Search by title, city, or address..."
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
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters & Page Size Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter (Active / Inactive / All) */}
            <select
              value={filters.status}
              onChange={(e) => applyFilters({ status: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated Only</option>
            </select>

            {/* Category Select */}
            <select
              value={filters.category}
              onChange={(e) => applyFilters({ category: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="penthouse">Penthouse</option>
            </select>

            {/* Listing Type Select */}
            <select
              value={filters.listingType}
              onChange={(e) => applyFilters({ listingType: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
            </select>

            {/* Featured Filter */}
            <select
              value={filters.featured}
              onChange={(e) => applyFilters({ featured: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">Featured: All</option>
              <option value="featured_only">Featured Only</option>
              <option value="standard_only">Standard Only</option>
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
            {/* Add Property Button */}
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#006655] hover:bg-[#19322F] dark:bg-[#06f9d0] dark:text-neutral-950 dark:hover:bg-[#006655] dark:hover:text-white text-white shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Property</span>
            </Link>

            {/* Results count badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              {isPending && (
                <svg className="w-3.5 h-3.5 animate-spin text-[#006655] dark:text-[#06f9d0]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              <span>
                {propertiesResult.total === 0
                  ? '0 Listings'
                  : `${startItem}-${endItem} of ${propertiesResult.total} Listings`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs relative">
        {/* Loading Progress Bar */}
        {isPending && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500 animate-pulse z-10" />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <th className="py-3.5 pl-5 pr-3">Property</th>
                <th className="px-3 py-3.5">Category & Type</th>
                <th className="px-3 py-3.5">Price</th>
                <th className="px-3 py-3.5">Specs</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-3 py-3.5 text-center">Featured</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-sm">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm font-medium">No properties match your filter criteria.</p>
                      <Link
                        href="/admin/properties/new"
                        className="mt-2 text-xs font-semibold text-[#006655] dark:text-[#06f9d0] hover:underline"
                      >
                        + Create a new listing
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                properties.map((prop) => {
                  const isUpdating = updatingId === prop.id;
                  const isPropertyActive = prop.isActive !== false;
                  const thumb = prop.images?.[0] || '/images/placeholder-property.jpg';

                  return (
                    <tr
                      key={prop.id}
                      className={`hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors ${
                        !isPropertyActive ? 'opacity-70 bg-neutral-50/40 dark:bg-neutral-900/40' : ''
                      }`}
                    >
                      {/* Property Thumbnail & Info */}
                      <td className="py-4 pl-5 pr-3 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={prop.title}
                              className={`w-full h-full object-cover ${!isPropertyActive ? 'grayscale-50' : ''}`}
                              loading="lazy"
                            />
                            {prop.badge && (
                              <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] font-bold text-center py-0.5 px-1 bg-black/70 text-white rounded backdrop-blur-xs truncate">
                                {prop.badge}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/properties/${prop.slug}`}
                              target="_blank"
                              className="font-semibold text-neutral-900 dark:text-white hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors truncate block text-sm"
                            >
                              {prop.title}
                            </Link>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {prop.location?.formatted || `${prop.location?.city}, ${prop.location?.state || ''}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Listing Type */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 w-fit">
                            {prop.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${
                              prop.listingType === 'for_sale'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {prop.listingType === 'for_sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {formatPrice(prop.price)}
                        </div>
                        {prop.listingType === 'for_rent' && (
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">/ month</span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="px-3 py-4 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">
                        <div>{prop.specs.bedrooms} beds • {prop.specs.bathrooms} baths</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{prop.specs.areaSqMeters} m² ({Math.round(prop.specs.areaSqMeters * 10.764)} sq ft)</div>
                      </td>

                      {/* Active Status Badge */}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        {isPropertyActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Featured Status Toggle */}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          disabled={isUpdating || !isPropertyActive}
                          onClick={() => handleToggleFeatured(prop)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006655] ${
                            prop.isFeatured ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                          } ${isUpdating || !isPropertyActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={`Toggle featured for ${prop.title}`}
                          title={!isPropertyActive ? 'Activate property to feature it' : 'Toggle featured'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              prop.isFeatured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                          {prop.isFeatured ? 'Featured' : 'Standard'}
                        </div>
                      </td>

                      {/* Actions: Edit, Preview, Deactivate / Reactivate */}
                      <td className="py-4 pl-3 pr-5 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Button */}
                          <Link
                            href={`/admin/properties/${prop.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-[#006655] dark:text-[#06f9d0] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 transition-colors"
                            title="Edit Listing"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </Link>

                          {/* Preview Link */}
                          <Link
                            href={`/properties/${prop.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                            title="View Property Page"
                          >
                            <span>Preview</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>

                          {/* Deactivate / Reactivate Button */}
                          {isPropertyActive ? (
                            <button
                              type="button"
                              onClick={() => setDeactivateTarget(prop)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                              title="Deactivate Listing"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleReactivate(prop)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                              title="Reactivate Listing"
                            >
                              {isUpdating ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              <span>Reactivate</span>
                            </button>
                          )}
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
        {propertiesResult.totalPages > 1 && (
          <div className="px-4 py-2 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
            <Pagination
              currentPage={propertiesResult.page}
              totalPages={propertiesResult.totalPages}
              totalItems={propertiesResult.total}
              pageSize={propertiesResult.pageSize}
              createPageUrl={(pageNum) => buildUrl({ page: pageNum })}
              onPageChange={(pageNum) => applyFilters({ page: pageNum })}
              className="py-3 border-t-0"
            />
          </div>
        )}
      </div>

      {/* Deactivate Confirmation Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Deactivate Property Listing?</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Are you sure you want to deactivate <strong className="text-neutral-900 dark:text-white">{deactivateTarget.title}</strong>? It will be hidden from public search, category filters, and featured showcases. You can reactivate it at any time.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeactivating}
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 text-sm font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeactivating}
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isDeactivating && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                <span>{isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


