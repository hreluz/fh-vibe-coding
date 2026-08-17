import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout';
import { SupabaseSetupBanner } from '@/components/home';
import {
  FeaturedHeader,
  FeaturedFilterBar,
  FeaturedList,
} from '@/components/featured';
import { getFeaturedPaginatedProperties } from '@/lib/services/properties';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CategoryFilterType, ListingFilterType } from '@/types/property';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Featured Collections | LuxeEstate',
  description:
    'Explore our curated portfolio of ultra-luxury estates, architectural masterpieces, and premium residences.',
};

interface FeaturedPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function FeaturedPage(props: FeaturedPageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1', 10) || 1;
  const category = (searchParams.category || 'all') as CategoryFilterType;
  const listingType = (searchParams.type || 'all') as ListingFilterType;
  const searchQuery = searchParams.q || '';

  const { isConfigured } = getSupabaseEnv();

  const paginatedResult = isConfigured
    ? await getFeaturedPaginatedProperties({
        page,
        pageSize: 6,
        category,
        listingType,
        query: searchQuery,
      })
    : {
        properties: [],
        total: 0,
        page: 1,
        pageSize: 6,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar activeTab="Featured" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {!isConfigured && <SupabaseSetupBanner />}

        <FeaturedHeader />

        <Suspense fallback={<div className="h-16 animate-pulse bg-black/5 dark:bg-white/5 rounded-2xl mb-8" />}>
          <FeaturedFilterBar totalItems={paginatedResult.total} />
        </Suspense>

        <FeaturedList
          properties={paginatedResult.properties}
          currentPage={paginatedResult.page}
          totalPages={paginatedResult.totalPages}
          totalItems={paginatedResult.total}
          pageSize={paginatedResult.pageSize}
        />
      </main>
    </div>
  );
}
