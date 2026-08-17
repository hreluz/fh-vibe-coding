'use client';

import React from 'react';
import { Property, ListingFilterType } from '@/types/property';
import { SectionHeader, PillTabs, PillTabItem, Button } from '@/components/ui';
import { PropertyCard } from '@/components/properties';

interface NewInMarketSectionProps {
  properties: Property[];
  listingFilter: ListingFilterType;
  onFilterChange: (filter: ListingFilterType) => void;
  onSelectProperty?: (property: Property) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const FILTER_OPTIONS: PillTabItem<ListingFilterType>[] = [
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
      <SectionHeader
        title="New in Market"
        subtitle="Fresh opportunities added this week."
        rightElement={
          <PillTabs
            items={FILTER_OPTIONS}
            activeValue={listingFilter}
            onChange={onFilterChange}
            variant="segmented"
          />
        }
      />

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
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="hover:shadow-md"
          >
            Load more properties
          </Button>
        </div>
      )}
    </section>
  );
}
