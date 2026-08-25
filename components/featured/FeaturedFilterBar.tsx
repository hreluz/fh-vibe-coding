'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategoryFilterType, ListingFilterType } from '@/types/property';
import { PillTabs, PillTabItem, SearchInput } from '@/components/ui';
import { useTranslation } from '@/components/providers';

interface FeaturedFilterBarProps {
  totalItems: number;
}

export function FeaturedFilterBar({ totalItems }: FeaturedFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const categories: PillTabItem<CategoryFilterType>[] = useMemo(
    () => [
      { label: t('featured.allCategories'), value: 'all' },
      { label: t('common.villa'), value: 'villa' },
      { label: t('common.penthouse'), value: 'penthouse' },
      { label: t('common.house'), value: 'house' },
      { label: t('common.apartment'), value: 'apartment' },
    ],
    [t]
  );

  const listingTypes: PillTabItem<ListingFilterType>[] = useMemo(
    () => [
      { label: t('common.all'), value: 'all' },
      { label: t('common.buy'), value: 'for_sale' },
      { label: t('common.rent'), value: 'for_rent' },
    ],
    [t]
  );

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
            placeholder={t('featured.searchPlaceholder')}
            buttonLabel={isPending ? t('common.searching') : t('common.search')}
          />
        </div>

        {/* Listing Type Segmented Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#5C706D] dark:text-gray-400">
            {t('featured.listing')}
          </span>
          <PillTabs
            items={listingTypes}
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
            items={categories}
            activeValue={currentCategory}
            onChange={handleCategoryChange}
            variant="pills"
          />
        </div>

        {/* Results Counter */}
        <div className="text-xs sm:text-sm font-medium text-[#5C706D] dark:text-gray-400">
          {totalItems === 1
            ? t('featured.showingSingle')
            : t('featured.showingMultiple', { count: totalItems })}
        </div>
      </div>
    </div>
  );
}

