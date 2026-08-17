'use client';

import React from 'react';
import { CategoryFilterType } from '@/types/property';
import { SearchInput, PillTabs, PillTabItem, Button } from '@/components/ui';

interface HeroSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
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
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenFiltersModal,
}: HeroSearchProps) {
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
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search by city, neighborhood, or address..."
          buttonLabel="Search"
        />

        {/* Category Pills & Filters */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          <PillTabs
            items={CATEGORIES}
            activeValue={selectedCategory}
            onChange={onSelectCategory}
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
