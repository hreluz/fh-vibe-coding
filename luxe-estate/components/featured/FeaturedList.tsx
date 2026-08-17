'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { FeaturedCard } from '@/components/properties';
import { Pagination, Button } from '@/components/ui';

interface FeaturedListProps {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export function FeaturedList({
  properties,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: FeaturedListProps) {
  return (
    <section>
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <FeaturedCard
              key={property.id}
              property={property}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-[#19322F]/5 dark:border-white/10 p-8">
          <div className="w-16 h-16 rounded-full bg-[#006655]/10 dark:bg-[#06f9d0]/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-3xl text-[#006655] dark:text-[#06f9d0]">
              star_border
            </span>
          </div>
          <h3 className="text-xl font-medium text-[#19322F] dark:text-white">
            No featured properties found
          </h3>
          <p className="text-[#5C706D] dark:text-gray-400 text-sm max-w-md mx-auto mt-2">
            No featured properties matched your current filter or search criteria.
          </p>
          <div className="mt-6">
            <Link href="/featured">
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      )}
    </section>
  );
}
