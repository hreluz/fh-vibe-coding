'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';

interface FeaturedCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function FeaturedCard({ property, onSelect }: FeaturedCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div
      onClick={() => onSelect?.(property)}
      className="group relative rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] bg-white dark:bg-white/5 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,102,85,0.18)] border border-[#19322F]/5 dark:border-white/10"
    >
      {/* Image & Badges Container */}
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={property.imageUrl}
        />

        {/* Top Left Badge */}
        {property.badge && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#19322F] dark:text-white shadow-sm">
            {property.badge}
          </div>
        )}

        {/* Top Right Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-[#006655] text-white shadow-md'
              : 'bg-white/90 dark:bg-black/60 text-[#19322F] dark:text-white hover:bg-[#006655] hover:text-white'
          }`}
        >
          <span className="material-icons text-xl">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Subtle Bottom Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>

      {/* Property Details */}
      <div className="p-6 relative bg-white dark:bg-white/5">
        <div className="flex justify-between items-start mb-2 gap-4">
          <div>
            <h3 className="text-xl font-medium text-[#19322F] dark:text-white group-hover:text-[#006655] dark:group-hover:text-[#06f9d0] transition-colors line-clamp-1">
              {property.title}
            </h3>
            <p className="text-[#5C706D] dark:text-gray-300 text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm text-[#006655] dark:text-[#06f9d0]">place</span>
              {property.location.formatted}
            </p>
          </div>
          <span className="text-xl font-bold text-[#006655] dark:text-[#06f9d0] whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>

        {/* Specs Divider Row */}
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-[#19322F]/5 dark:border-white/10 text-sm text-[#5C706D] dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">king_bed</span>
            <span>{property.specs.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">bathtub</span>
            <span>{property.specs.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">square_foot</span>
            <span>{property.specs.areaSqMeters.toLocaleString()} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
}
