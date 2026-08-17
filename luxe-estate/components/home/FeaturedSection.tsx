'use client';

import React from 'react';
import { Property } from '@/types/property';
import { SectionHeader } from '@/components/ui';
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
  if (properties.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header */}
      <SectionHeader
        title="Featured Collections"
        subtitle="Curated properties for the discerning eye."
        actionText="View all"
        actionIcon="arrow_forward"
        onAction={onViewAll}
      />

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
