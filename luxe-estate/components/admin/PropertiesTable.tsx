'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { Property, PropertyCategory, ListingType } from '@/types/property';

interface PropertiesTableProps {
  initialProperties: Property[];
  onStatsRefresh?: () => void;
}

export function PropertiesTable({ initialProperties, onStatsRefresh }: PropertiesTableProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedListingType, setSelectedListingType] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all'); // all, featured_only, standard_only
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleFeatured = async (property: Property) => {
    const nextState = !property.isFeatured;
    const previousState = property.isFeatured;

    // Optimistic update
    setProperties((prev) =>
      prev.map((p) => (p.id === property.id ? { ...p, isFeatured: nextState } : p))
    );
    setUpdatingId(property.id);

    try {
      const res = await fetch('/api/admin/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
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
      // Revert optimistic update
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, isFeatured: previousState } : p))
      );
      const msg = err instanceof Error ? err.message : 'Failed to update featured status';
      showToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesLocation = (p.location?.formatted || p.location?.city || '').toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesCategory) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Listing type filter
      if (selectedListingType !== 'all' && p.listingType !== selectedListingType) {
        return false;
      }

      // Featured filter
      if (featuredFilter === 'featured_only' && !p.isFeatured) return false;
      if (featuredFilter === 'standard_only' && p.isFeatured) return false;

      return true;
    });
  }, [properties, searchQuery, selectedCategory, selectedListingType, featuredFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
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

      {/* Control Bar: Filters & Search */}
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Listings</option>
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
            </select>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#006655] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="featured_only">Featured Only</option>
              <option value="standard_only">Standard Only</option>
            </select>

            {/* Results count badge */}
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl">
              {filteredProperties.length} of {properties.length} Listings
            </div>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th scope="col" className="py-3.5 pl-5 pr-3">Property</th>
                <th scope="col" className="px-3 py-3.5">Category & Type</th>
                <th scope="col" className="px-3 py-3.5">Price</th>
                <th scope="col" className="px-3 py-3.5">Specs</th>
                <th scope="col" className="px-3 py-3.5 text-center">Featured</th>
                <th scope="col" className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                    <div className="max-w-xs mx-auto">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">No properties found</p>
                      <p className="text-xs mt-1">Try adjusting your search query or filter settings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => {
                  const isUpdating = updatingId === prop.id;
                  const thumb = prop.images?.[0] || '/images/placeholder-property.jpg';

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Property Thumbnail & Info */}
                      <td className="py-4 pl-5 pr-3 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt={prop.title}
                              className="w-full h-full object-cover"
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

                      {/* Featured Status Toggle */}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleFeatured(prop)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#006655] ${
                            prop.isFeatured ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
                          } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                          aria-label={`Toggle featured for ${prop.title}`}
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

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-5 whitespace-nowrap text-right text-xs">
                        <Link
                          href={`/properties/${prop.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                        >
                          <span>Preview</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
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
