'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/types/property';
import { SectionHeader, IconButton } from '@/components/ui';
import { FeaturedCard } from '@/components/properties';

interface FeaturedSectionProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
  onViewAll?: () => void;
}

export function FeaturedSection({
  properties,
  onSelectProperty,
  onViewAll,
}: FeaturedSectionProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(properties.length > 1);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/featured');
    }
  };

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const itemWidth = scrollRef.current.firstElementChild?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / (itemWidth + 24));
    setActiveIndex(Math.min(Math.max(0, index), properties.length - 1));
  }, [properties.length]);

  useEffect(() => {
    updateScrollState();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', updateScrollState, { passive: true });
    }
    return () => {
      if (current) {
        current.removeEventListener('scroll', updateScrollState);
      }
    };
  }, [updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.firstElementChild?.clientWidth || container.clientWidth * 0.8;
    const scrollAmount = itemWidth + 24;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (properties.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header with Navigation Controls */}
      <SectionHeader
        title="Featured Collections"
        subtitle="Curated luxury properties for the discerning eye."
        rightElement={
          <div className="flex items-center gap-4">
            {/* View All Link */}
            <button
              onClick={handleViewAll}
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-[#006655] dark:text-[#06f9d0] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>View all</span>
              <span className="material-icons text-sm leading-none">arrow_forward</span>
            </button>

            {/* Carousel Navigation Buttons */}
            {properties.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-[#19322F]/10 dark:border-white/10">
                <span className="text-xs font-medium text-[#5C706D] dark:text-gray-400 mr-1">
                  {activeIndex + 1} / {properties.length}
                </span>
                <IconButton
                  icon="chevron_left"
                  size="sm"
                  variant="outline"
                  shape="rounded"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous featured property"
                />
                <IconButton
                  icon="chevron_right"
                  size="sm"
                  variant="outline"
                  shape="rounded"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Next featured property"
                />
              </div>
            )}
          </div>
        }
      />

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 -mx-1 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[88vw] sm:w-[500px] lg:w-[580px] flex-shrink-0 snap-start"
          >
            <FeaturedCard
              property={property}
              onSelect={onSelectProperty}
            />
          </div>
        ))}
      </div>

      {/* Mobile Indicator Dots */}
      {properties.length > 1 && (
        <div className="flex sm:hidden justify-center items-center gap-1.5 mt-4">
          {properties.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                if (!scrollRef.current) return;
                const itemWidth = scrollRef.current.firstElementChild?.clientWidth || 300;
                scrollRef.current.scrollTo({
                  left: i * (itemWidth + 24),
                  behavior: 'smooth',
                });
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-6 bg-[#006655] dark:bg-[#06f9d0]'
                  : 'w-1.5 bg-[#19322F]/20 dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

