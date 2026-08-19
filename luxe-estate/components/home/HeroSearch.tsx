'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategoryFilterType, PropertyFilterValues } from '@/types/property';
import { SearchInput, PillTabs, PillTabItem } from '@/components/ui';
import { SearchFiltersModal } from './SearchFiltersModal';

interface HeroSearchProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: CategoryFilterType;
  onSelectCategory?: (category: CategoryFilterType) => void;
  onOpenFiltersModal?: () => void;
}

const CATEGORIES: PillTabItem<CategoryFilterType>[] = [
  { label: 'All', value: 'all' },
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Villa', value: 'villa' },
  { label: 'Penthouse', value: 'penthouse' },
];

export function HeroSearch({
  searchTerm: controlledSearch,
  onSearchChange,
  selectedCategory: controlledCategory,
  onSelectCategory,
  onOpenFiltersModal,
}: HeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Read URL search params
  const currentParamSearch = searchParams.get('q') || '';
  const currentParamLocation = searchParams.get('location') || '';
  const currentParamCategory = (searchParams.get('category') || 'all') as CategoryFilterType;
  const currentParamMinPrice = searchParams.get('minPrice')
    ? parseInt(searchParams.get('minPrice')!, 10)
    : undefined;
  const currentParamMaxPrice = searchParams.get('maxPrice')
    ? parseInt(searchParams.get('maxPrice')!, 10)
    : undefined;
  const currentParamBeds = searchParams.get('beds')
    ? parseInt(searchParams.get('beds')!, 10)
    : undefined;
  const currentParamBaths = searchParams.get('baths')
    ? parseInt(searchParams.get('baths')!, 10)
    : undefined;
  const currentParamAmenities = searchParams.get('amenities')
    ? searchParams.get('amenities')!.split(',').filter(Boolean)
    : [];

  const effectiveSearch = controlledSearch ?? currentParamSearch;
  const activeCategory = controlledCategory ?? currentParamCategory;
  const [localSearch, setLocalSearch] = useState(effectiveSearch);
  const [prevEffectiveSearch, setPrevEffectiveSearch] = useState(effectiveSearch);

  if (prevEffectiveSearch !== effectiveSearch) {
    setPrevEffectiveSearch(effectiveSearch);
    setLocalSearch(effectiveSearch);
  }

  // Calculate active filter count (excluding default values)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentParamLocation) count += 1;
    if (currentParamMinPrice !== undefined && currentParamMinPrice > 0) count += 1;
    if (currentParamMaxPrice !== undefined && currentParamMaxPrice > 0) count += 1;
    if (currentParamCategory && currentParamCategory !== 'all') count += 1;
    if (currentParamBeds !== undefined && currentParamBeds > 0) count += 1;
    if (currentParamBaths !== undefined && currentParamBaths > 0) count += 1;
    if (currentParamAmenities.length > 0) count += currentParamAmenities.length;
    return count;
  }, [
    currentParamLocation,
    currentParamMinPrice,
    currentParamMaxPrice,
    currentParamCategory,
    currentParamBeds,
    currentParamBaths,
    currentParamAmenities,
  ]);

  const updateUrlParams = (newParams: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Always reset to page 1 on filter changes
    params.delete('page');

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSearchSubmit = () => {
    updateUrlParams({ q: localSearch.trim() || undefined });
  };

  const handleCategorySelect = (cat: CategoryFilterType) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    updateUrlParams({ category: cat === 'all' ? undefined : cat });
  };

  const handleApplyFilters = (filters: PropertyFilterValues) => {
    updateUrlParams({
      location: filters.location || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      category: filters.category && filters.category !== 'all' ? filters.category : undefined,
      beds: filters.bedrooms || undefined,
      baths: filters.bathrooms || undefined,
      amenities: filters.amenities && filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
    });
  };

  const handleOpenFilters = () => {
    if (onOpenFiltersModal) {
      onOpenFiltersModal();
    } else {
      setIsModalOpen(true);
    }
  };

  const modalInitialFilters: PropertyFilterValues = {
    location: currentParamLocation,
    minPrice: currentParamMinPrice,
    maxPrice: currentParamMaxPrice,
    category: activeCategory,
    bedrooms: currentParamBeds,
    bathrooms: currentParamBaths,
    amenities: currentParamAmenities,
    query: effectiveSearch,
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#19322F] dark:text-white leading-tight tracking-tight">
          Find your{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium text-[#19322F] dark:text-white">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3.5 bg-[#D9ECC8] dark:bg-[#006655]/40 -rotate-1 z-0 rounded-sm"></span>
          </span>
          .
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <SearchInput
            value={localSearch}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search by city, neighborhood, or address..."
            buttonLabel={isPending ? 'Searching...' : 'Search'}
          />
        </div>

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          <PillTabs
            items={CATEGORIES}
            activeValue={activeCategory}
            onChange={handleCategorySelect}
            variant="pills"
          />

          <div className="w-px h-6 bg-[#19322F]/10 dark:bg-white/10 mx-1 flex-shrink-0" />

          <button
            type="button"
            onClick={handleOpenFilters}
            className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm flex-shrink-0 transition-all cursor-pointer border ${
              activeFilterCount > 0
                ? 'bg-[#006655] text-white border-[#006655] shadow-sm hover:bg-[#005244]'
                : 'bg-white dark:bg-white/5 border-transparent text-[#19322F] dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <span className="material-icons text-base leading-none">tune</span>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#006655] text-xs px-1.5 py-0.2 rounded-full font-bold leading-tight">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <SearchFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFilters={modalInitialFilters}
        onApplyFilters={handleApplyFilters}
      />
    </section>
  );
}

