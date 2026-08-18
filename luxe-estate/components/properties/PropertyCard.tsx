'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { Card, Badge, IconButton } from '@/components/ui';

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

  const handleClick = () => {
    if (onSelect) {
      onSelect(property);
    }
  };

  return (
    <Link
      href={`/properties/${property.slug}`}
      onClick={handleClick}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006655] rounded-xl"
    >
      <Card
        as="article"
        variant="default"
        interactive
        rounded="xl"
        className="h-full"
      >
        {/* Media Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={property.images[0]}
          />

          {/* Favorite Action Button */}
          <div className="absolute top-3 right-3 z-10">
            <IconButton
              icon="favorite_border"
              activeIcon="favorite"
              active={isFavorite}
              variant="floating"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            />
          </div>

          {/* Listing Status Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <Badge variant={isRent ? 'for_rent' : 'for_sale'}>
              {isRent ? 'FOR RENT' : 'FOR SALE'}
            </Badge>
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
      </Card>
    </Link>
  );
}
