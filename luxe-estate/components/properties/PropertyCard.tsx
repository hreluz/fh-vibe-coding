'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const isRent = property.listingType === 'for_rent';

  return (
    <article
      onClick={() => onSelect?.(property)}
      className="bg-white dark:bg-white/5 rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_40px_-10px_rgba(6,249,208,0.06)] transition-all duration-300 group cursor-pointer h-full flex flex-col border border-[#19322F]/5 dark:border-white/10"
    >
      {/* Media Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.imageAlt || property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={property.imageUrl}
        />

        {/* Favorite Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
            isFavorite
              ? 'bg-[#006655] text-white shadow-sm'
              : 'bg-white/90 dark:bg-black/50 text-[#19322F] dark:text-white hover:bg-[#006655] hover:text-white'
          }`}
        >
          <span className="material-icons text-lg leading-none">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Listing Status Badge */}
        <div
          className={`absolute bottom-3 left-3 text-white text-[11px] font-bold tracking-wider px-2.5 py-1 rounded shadow-sm uppercase ${
            isRent ? 'bg-[#006655]' : 'bg-[#19322F] dark:bg-black/80 dark:border dark:border-white/10'
          }`}
        >
          {isRent ? 'FOR RENT' : 'FOR SALE'}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-transparent">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-bold text-lg text-[#19322F] dark:text-white">
            {formattedPrice}
            {isRent && (
              <span className="text-xs font-normal text-[#5C706D] dark:text-gray-400 ml-0.5">/mo</span>
            )}
          </h3>
        </div>

        <h4 className="text-[#19322F] dark:text-gray-100 font-medium text-sm truncate mb-1 group-hover:text-[#006655] dark:group-hover:text-[#06f9d0] transition-colors">
          {property.title}
        </h4>

        <p className="text-[#5C706D] dark:text-gray-300 text-xs mb-4 truncate">
          {property.location.formatted}
        </p>

        {/* Specs Row */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10 text-xs text-[#5C706D] dark:text-gray-300">
          <div className="flex items-center gap-1">
            <span className="material-icons text-sm text-[#006655] dark:text-[#06f9d0]">king_bed</span>
            <span>{property.specs.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons text-sm text-[#006655] dark:text-[#06f9d0]">bathtub</span>
            <span>{property.specs.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons text-sm text-[#006655] dark:text-[#06f9d0]">square_foot</span>
            <span>{property.specs.areaSqMeters}m²</span>
          </div>
        </div>
      </div>
    </article>
  );
}
