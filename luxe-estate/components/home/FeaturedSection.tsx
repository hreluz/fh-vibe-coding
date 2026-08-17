'use client';

import React from 'react';
import { Property } from '@/types/property';
import { FeaturedCard } from '@/components/properties/FeaturedCard';

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
  if (properties.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-[#19322F] dark:text-white">
            Featured Collections
          </h2>
          <p className="text-[#5C706D] dark:text-gray-300 mt-1 text-sm">
            Curated properties for the discerning eye.
          </p>
        </div>
        <button
          onClick={onViewAll}
          type="button"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#006655] dark:text-[#06f9d0] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>View all</span>
          <span className="material-icons text-sm">arrow_forward</span>
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedCard
            key={property.id}
            property={property}
            onSelect={onSelectProperty}
          />
        ))}
      </div>
    </section>
  );
}
