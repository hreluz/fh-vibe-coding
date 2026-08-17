'use client';

import React from 'react';
import { Property, ListingFilterType } from '@/types/property';
import { PropertyCard } from '@/components/properties/PropertyCard';

interface NewInMarketSectionProps {
  properties: Property[];
  listingFilter: ListingFilterType;
  onFilterChange: (filter: ListingFilterType) => void;
  onSelectProperty?: (property: Property) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const FILTER_OPTIONS: { label: string; value: ListingFilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Buy', value: 'for_sale' },
  { label: 'Rent', value: 'for_rent' },
];

export function NewInMarketSection({
  properties,
  listingFilter,
  onFilterChange,
  onSelectProperty,
  hasMore = false,
  onLoadMore,
}: NewInMarketSectionProps) {
  return (
    <section>
      {/* Section Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#19322F] dark:text-white">
            New in Market
          </h2>
          <p className="text-[#5C706D] dark:text-gray-300 mt-1 text-sm">
            Fresh opportunities added this week.
          </p>
        </div>

        {/* Listing Type Segmented Tabs */}
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl shadow-sm border border-[#19322F]/5 dark:border-white/10 self-start sm:self-auto">
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = listingFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange(opt.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#19322F] dark:bg-white text-white dark:text-[#19322F] shadow-sm font-semibold'
                    : 'text-[#5C706D] dark:text-gray-300 hover:text-[#19322F] dark:hover:text-white hover:bg-[#EEF6F6]/60 dark:hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Properties Responsive Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-[#19322F]/5 dark:border-white/10">
          <span className="material-icons text-4xl text-[#5C706D] dark:text-gray-400 mb-2">
            search_off
          </span>
          <h3 className="text-lg font-medium text-[#19322F] dark:text-white">No properties found</h3>
          <p className="text-[#5C706D] dark:text-gray-400 text-sm mt-1">
            Try adjusting your search criteria or category filters.
          </p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-8 py-3 bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 hover:border-[#006655] dark:hover:border-[#06f9d0] hover:text-[#006655] dark:hover:text-[#06f9d0] text-[#19322F] dark:text-white font-medium rounded-xl transition-all hover:shadow-md cursor-pointer"
          >
            Load more properties
          </button>
        </div>
      )}
    </section>
  );
}
