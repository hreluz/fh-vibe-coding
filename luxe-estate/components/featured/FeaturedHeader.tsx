'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';

export function FeaturedHeader() {
  return (
    <div className="pt-8 pb-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#5C706D] dark:text-gray-400 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors"
        >
          <span className="material-icons text-base">arrow_back</span>
          <span>Back to Home</span>
        </Link>
        <span>/</span>
        <span className="text-[#19322F] dark:text-white font-medium">Featured Collections</span>
      </nav>

      {/* Hero Content */}
      <div className="max-w-3xl">
        <div className="mb-3">
          <Badge variant="featured" size="md">
            Curated Portfolio
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#19322F] dark:text-white tracking-tight">
          Featured Collections
        </h1>
        <p className="text-[#5C706D] dark:text-gray-300 text-base sm:text-lg mt-3 leading-relaxed">
          Handpicked architectural wonders, prime locations, and ultra-luxury estates
          curated for the most discerning buyers and investors.
        </p>
      </div>
    </div>
  );
}
