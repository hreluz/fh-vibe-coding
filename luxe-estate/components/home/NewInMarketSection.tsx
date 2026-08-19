'use client';

import React, { useTransition, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Property, ListingFilterType } from '@/types/property';
import { SectionHeader, PillTabs, PillTabItem, Pagination } from '@/components/ui';
import { PropertyCard } from '@/components/properties';
import { useTranslation } from '@/components/providers';

interface NewInMarketSectionProps {
  properties: Property[];
  listingFilter?: ListingFilterType;
  onFilterChange?: (filter: ListingFilterType) => void;
  onSelectProperty?: (property: Property) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  createPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

export function NewInMarketSection({
  properties,
  listingFilter: controlledFilter,
  onFilterChange,
  onSelectProperty,
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 8,
  createPageUrl: customCreatePageUrl,
  onPageChange,
}: NewInMarketSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const filterOptions: PillTabItem<ListingFilterType>[] = useMemo(
    () => [
      { label: t('common.all'), value: 'all' },
      { label: t('common.buy'), value: 'for_sale' },
      { label: t('common.rent'), value: 'for_rent' },
    ],
    [t]
  );

  const currentParamFilter = (searchParams.get('type') || 'all') as ListingFilterType;
  const activeListingFilter = controlledFilter ?? currentParamFilter;

  const handleFilterChange = (filter: ListingFilterType) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (filter !== 'all') {
      params.set('type', filter);
    } else {
      params.delete('type');
    }
    // Reset to page 1 on filter changes
    params.delete('page');

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const defaultCreatePageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pageUrlGenerator = customCreatePageUrl || defaultCreatePageUrl;

  return (
    <section>
      {/* Section Header & Segmented Tabs */}
      <SectionHeader
        title={t('newInMarket.title')}
        subtitle={t('newInMarket.subtitle')}
        rightElement={
          <PillTabs
            items={filterOptions}
            activeValue={activeListingFilter}
            onChange={handleFilterChange}
            variant="segmented"
          />
        }
      />

      {/* Properties Responsive Grid */}
      {properties.length > 0 ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${
            isPending ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-white/5 rounded-2xl border border-[#19322F]/5 dark:border-white/10 flex flex-col items-center justify-center">
          <span className="material-icons text-4xl text-[#5C706D] dark:text-gray-400 mb-2">
            search_off
          </span>
          <h3 className="text-lg font-medium text-[#19322F] dark:text-white">
            {t('newInMarket.noResultsTitle')}
          </h3>
          <p className="text-[#5C706D] dark:text-gray-400 text-sm mt-1 max-w-sm">
            {t('newInMarket.noResultsDesc')}
          </p>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.push(pathname, { scroll: false });
              });
            }}
            className="mt-4 px-4 py-2 bg-[#006655] hover:bg-[#005244] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            {t('common.clearFilters')}
          </button>
        </div>
      )}

      {/* Server-Side Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            createPageUrl={pageUrlGenerator}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

