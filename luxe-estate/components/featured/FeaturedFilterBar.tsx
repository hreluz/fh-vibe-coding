'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategoryFilterType, ListingFilterType } from '@/types/property';
import { PillTabs, PillTabItem, SearchInput } from '@/components/ui';

interface FeaturedFilterBarProps {
  totalItems: number;
}

const CATEGORIES: PillTabItem<CategoryFilterType>[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Villa', value: 'villa' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
];

const LISTING_TYPES: PillTabItem<ListingFilterType>[] = [
  { label: 'All', value: 'all' },
  { label: 'Buy', value: 'for_sale' },
  { label: 'Rent', value: 'for_rent' },
];

export function FeaturedFilterBar({ totalItems }: FeaturedFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';
  const currentCategory = (searchParams.get('category') || 'all') as CategoryFilterType;
  const currentListingType = (searchParams.get('type') || 'all') as ListingFilterType;

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchTerm(currentSearch);
  }

  const updateFilters = (newParams: {
    q?: string;
    category?: string;
    type?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.q !== undefined) {
      if (newParams.q.trim()) {
        params.set('q', newParams.q.trim());
      } else {
        params.delete('q');
      }
    }

    if (newParams.category !== undefined) {
      if (newParams.category !== 'all') {
        params.set('category', newParams.category);
      } else {
        params.delete('category');
      }
    }

    if (newParams.type !== undefined) {
      if (newParams.type !== 'all') {
        params.set('type', newParams.type);
      } else {
        params.delete('type');
      }
    }

    // Reset pagination
    params.delete('page');

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const handleSearchSubmit = () => {
    updateFilters({ q: searchTerm });
  };

  const handleCategoryChange = (category: CategoryFilterType) => {
    updateFilters({ category });
  };

  const handleListingTypeChange = (type: ListingFilterType) => {
    updateFilters({ type });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Top Filter Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full lg:max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearchSubmit}
            placeholder="Search featured luxury properties..."
            buttonLabel={isPending ? 'Searching...' : 'Search'}
          />
        </div>

        {/* Listing Type Segmented Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#5C706D] dark:text-gray-400">
            Listing:
          </span>
          <PillTabs
            items={LISTING_TYPES}
            activeValue={currentListingType}
            onChange={handleListingTypeChange}
            variant="segmented"
          />
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#19322F]/5 dark:border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <PillTabs
            items={CATEGORIES}
            activeValue={currentCategory}
            onChange={handleCategoryChange}
            variant="pills"
          />
        </div>

        {/* Results Counter */}
        <div className="text-xs sm:text-sm font-medium text-[#5C706D] dark:text-gray-400">
          Showing <span className="text-[#006655] dark:text-[#06f9d0] font-semibold">{totalItems}</span> {totalItems === 1 ? 'featured property' : 'featured properties'}
        </div>
      </div>
    </div>
  );
}
