'use client';

import React from 'react';
import { CategoryFilterType } from '@/types/property';

interface HeroSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
  onOpenFiltersModal?: () => void;
}

const CATEGORIES: { label: string; value: CategoryFilterType }[] = [
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
            <span className="material-icons text-[#5C706D] dark:text-gray-400 text-2xl group-focus-within:text-[#006655] dark:group-focus-within:text-[#06f9d0] transition-colors">
              search
            </span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 sm:pl-14 pr-28 sm:pr-32 py-4 rounded-xl border border-[#19322F]/5 dark:border-white/10 bg-white dark:bg-white/5 text-[#19322F] dark:text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] placeholder-[#5C706D]/60 dark:placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-[#006655] dark:focus:ring-[#06f9d0] focus:bg-white dark:focus:bg-white/10 transition-all text-base sm:text-lg"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 px-5 sm:px-7 bg-[#006655] hover:bg-[#006655]/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-md shadow-[#006655]/20 text-sm sm:text-base cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                type="button"
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#19322F] dark:bg-white dark:text-[#19322F] text-white shadow-md shadow-[#19322F]/15 -translate-y-0.5 font-semibold'
                    : 'bg-white dark:bg-white/5 border border-[#19322F]/10 dark:border-white/10 text-[#5C706D] dark:text-gray-300 hover:text-[#19322F] dark:hover:text-white hover:border-[#006655]/50 dark:hover:border-white/30 hover:bg-[#EEF6F6] dark:hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <div className="w-px h-6 bg-[#19322F]/10 dark:bg-white/10 mx-1"></div>

          <button
            type="button"
            onClick={onOpenFiltersModal}
            className="whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-[#19322F] dark:text-white font-medium text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="material-icons text-base">tune</span>
            <span>Filters</span>
          </button>
        </div>
      </div>
    </section>
  );
}
