'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategoryFilterType, PropertyFilterValues } from '@/types/property';
import { SearchInput, PillTabs, PillTabItem } from '@/components/ui';
import { useTranslation } from '@/components/providers';
import { SearchFiltersModal } from './SearchFiltersModal';

interface HeroSearchProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: CategoryFilterType;
  onSelectCategory?: (category: CategoryFilterType) => void;
  onOpenFiltersModal?: () => void;
}

function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    const millions = price / 1000000;
    return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (price >= 1000) {
    const thousands = price / 1000;
    return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0)}K`;
  }
  return `$${price.toLocaleString()}`;
}

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
  const { t } = useTranslation();

  const categories: PillTabItem<CategoryFilterType>[] = useMemo(
    () => [
      { label: t('common.all'), value: 'all' },
      { label: t('common.house'), value: 'house' },
      { label: t('common.apartment'), value: 'apartment' },
      { label: t('common.villa'), value: 'villa' },
      { label: t('common.penthouse'), value: 'penthouse' },
    ],
    [t]
  );

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

  const handleClearAllFilters = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
    if (onSelectCategory) onSelectCategory('all');
    updateUrlParams({
      q: undefined,
      location: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      beds: undefined,
      baths: undefined,
      amenities: undefined,
    });
  };

  // Build active filter chips for display
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (currentParamSearch) {
      chips.push({
        id: 'search',
        label: `"${currentParamSearch}"`,
        onRemove: () => {
          setLocalSearch('');
          if (onSearchChange) onSearchChange('');
          updateUrlParams({ q: undefined });
        },
      });
    }

    if (currentParamLocation) {
      chips.push({
        id: 'location',
        label: `${t('filters.location')}: ${currentParamLocation}`,
        onRemove: () => updateUrlParams({ location: undefined }),
      });
    }

    if (currentParamCategory && currentParamCategory !== 'all') {
      const catLabel = categories.find((c) => c.value === currentParamCategory)?.label || currentParamCategory;
      chips.push({
        id: 'category',
        label: catLabel,
        onRemove: () => {
          if (onSelectCategory) onSelectCategory('all');
          updateUrlParams({ category: undefined });
        },
      });
    }

    if (currentParamMinPrice !== undefined && currentParamMaxPrice !== undefined) {
      chips.push({
        id: 'price-range',
        label: `${formatPriceShort(currentParamMinPrice)} - ${formatPriceShort(currentParamMaxPrice)}`,
        onRemove: () => updateUrlParams({ minPrice: undefined, maxPrice: undefined }),
      });
    } else if (currentParamMinPrice !== undefined) {
      chips.push({
        id: 'min-price',
        label: `Min ${formatPriceShort(currentParamMinPrice)}`,
        onRemove: () => updateUrlParams({ minPrice: undefined }),
      });
    } else if (currentParamMaxPrice !== undefined) {
      chips.push({
        id: 'max-price',
        label: `Max ${formatPriceShort(currentParamMaxPrice)}`,
        onRemove: () => updateUrlParams({ maxPrice: undefined }),
      });
    }

    if (currentParamBeds !== undefined && currentParamBeds > 0) {
      chips.push({
        id: 'beds',
        label: t('hero.bedsCount', { count: currentParamBeds }),
        onRemove: () => updateUrlParams({ beds: undefined }),
      });
    }

    if (currentParamBaths !== undefined && currentParamBaths > 0) {
      chips.push({
        id: 'baths',
        label: t('hero.bathsCount', { count: currentParamBaths }),
        onRemove: () => updateUrlParams({ baths: undefined }),
      });
    }

    if (currentParamAmenities.length > 0) {
      currentParamAmenities.forEach((amenity) => {
        chips.push({
          id: `amenity-${amenity}`,
          label: t(`amenities.${amenity}`),
          onRemove: () => {
            const next = currentParamAmenities.filter((a) => a !== amenity);
            updateUrlParams({ amenities: next.length > 0 ? next.join(',') : undefined });
          },
        });
      });
    }

    return chips;
  }, [
    currentParamSearch,
    currentParamLocation,
    currentParamCategory,
    currentParamMinPrice,
    currentParamMaxPrice,
    currentParamBeds,
    currentParamBaths,
    currentParamAmenities,
    categories,
    onSearchChange,
    onSelectCategory,
    t,
  ]);

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
          {t('hero.title')}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-[#5C706D] dark:text-gray-300 max-w-2xl mx-auto -mt-3">
          {t('hero.subtitle')}
        </p>

        {/* Search Bar */}
        <div className="relative">
          <SearchInput
            value={localSearch}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder={t('hero.searchPlaceholder')}
            buttonLabel={isPending ? t('common.searching') : t('common.search')}
          />
        </div>

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          <PillTabs
            items={categories}
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
            <span>{t('hero.filters')}</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#006655] text-xs px-1.5 py-0.2 rounded-full font-bold leading-tight">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 animate-fadeIn">
            <span className="text-xs text-[#5C706D] dark:text-gray-400 mr-1">
              {t('hero.activeFilters')}:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#19322F]/5 dark:bg-white/10 text-[#19322F] dark:text-white border border-[#19322F]/10 dark:border-white/10 hover:border-[#006655]/40 dark:hover:border-[#06f9d0]/40 transition-colors shadow-2xs"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter ${chip.label}`}
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 text-[#5C706D] dark:text-gray-300 hover:text-[#19322F] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-icons text-[12px] leading-none">close</span>
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#006655] dark:text-[#06f9d0] hover:underline cursor-pointer transition-all"
            >
              <span>{t('hero.clearAll')}</span>
            </button>
          </div>
        )}
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


