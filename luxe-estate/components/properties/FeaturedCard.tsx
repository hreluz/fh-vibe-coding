'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { Card, Badge, IconButton } from '@/components/ui';
import { useTranslation } from '@/components/providers';

interface FeaturedCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export function FeaturedCard({ property, onSelect }: FeaturedCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const handleClick = () => {
    if (onSelect) {
      onSelect(property);
    }
  };

  return (
    <Link
      href={`/properties/${property.slug}`}
      onClick={handleClick}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006655] rounded-2xl"
    >
      <Card
        variant="featured"
        interactive
        rounded="2xl"
        className="relative h-full"
      >
        {/* Image & Badges Container */}
        <div className="aspect-[4/3] w-full overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={property.images[0]}
          />

          {/* Top Left Badge */}
          {property.badge && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="featured" size="lg">
                {property.badge}
              </Badge>
            </div>
          )}

          {/* Top Right Favorite Button */}
          <div className="absolute top-4 right-4 z-10">
            <IconButton
              icon="favorite_border"
              activeIcon="favorite"
              active={isFavorite}
              variant="floating"
              size="md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            />
          </div>

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
              <span>
                {property.specs.bedrooms} {property.specs.bedrooms === 1 ? t('common.bed') : t('common.beds')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">bathtub</span>
              <span>
                {property.specs.bathrooms} {property.specs.bathrooms === 1 ? t('common.bath') : t('common.baths')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">square_foot</span>
              <span>{property.specs.areaSqMeters.toLocaleString()} {t('common.sqm')}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

