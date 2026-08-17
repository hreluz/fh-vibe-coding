'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategoryFilterType } from '@/types/property';
import { SearchInput, PillTabs, PillTabItem, Button } from '@/components/ui';

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

  const currentParamSearch = searchParams.get('q') || '';
  const currentParamCategory = (searchParams.get('category') || 'all') as CategoryFilterType;

  const [localSearch, setLocalSearch] = useState(controlledSearch ?? currentParamSearch);
  const activeCategory = controlledCategory ?? currentParamCategory;

  useEffect(() => {
    if (controlledSearch !== undefined) {
      setLocalSearch(controlledSearch);
    } else {
      setLocalSearch(currentParamSearch);
    }
  }, [controlledSearch, currentParamSearch]);

  const updateUrlParams = (newParams: { q?: string; category?: string }) => {
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

    // Reset to page 1 on filter changes
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
    updateUrlParams({ q: localSearch });
  };

  const handleCategorySelect = (cat: CategoryFilterType) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    updateUrlParams({ category: cat });
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

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenFiltersModal}
            icon="tune"
            className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm flex-shrink-0"
          >
            Filters
          </Button>
        </div>
      </div>
    </section>
  );
}
