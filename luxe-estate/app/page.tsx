import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout';
import {
  HeroSearch,
  FeaturedSection,
  NewInMarketSection,
  SupabaseSetupBanner,
} from '@/components/home';
import { getFeaturedProperties, getPaginatedProperties } from '@/lib/services/properties';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CategoryFilterType, ListingFilterType } from '@/types/property';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1', 10) || 1;
  const category = (searchParams.category || 'all') as CategoryFilterType;
  const listingType = (searchParams.type || 'all') as ListingFilterType;
  const searchQuery = searchParams.q || '';

  const { isConfigured } = getSupabaseEnv();

  // Active Navbar tab
  const activeNavTab =
    listingType === 'for_sale' ? 'Buy' : listingType === 'for_rent' ? 'Rent' : 'Buy';

  // Fetch data on the server in parallel if configured
  const [featuredProperties, paginatedResult] = isConfigured
    ? await Promise.all([
        getFeaturedProperties({ category, query: searchQuery }),
        getPaginatedProperties({
          page,
          pageSize: 8,
          category,
          listingType,
          query: searchQuery,
        }),
      ])
    : [[], { properties: [], total: 0, page: 1, pageSize: 8, totalPages: 0, hasPrevPage: false, hasNextPage: false }];

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar activeTab={activeNavTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {!isConfigured && <SupabaseSetupBanner />}

        <Suspense fallback={<div className="h-40 animate-pulse bg-black/5 dark:bg-white/5 rounded-2xl my-8" />}>
          <HeroSearch
            searchTerm={searchQuery}
            selectedCategory={category}
          />
        </Suspense>

        {/* Featured Collections Section */}
        {featuredProperties.length > 0 && (
          <FeaturedSection properties={featuredProperties} />
        )}

        {/* New in Market Section with Server-Side Pagination */}
        <NewInMarketSection
          properties={paginatedResult.properties}
          listingFilter={listingType}
          currentPage={paginatedResult.page}
          totalPages={paginatedResult.totalPages}
          totalItems={paginatedResult.total}
          pageSize={paginatedResult.pageSize}
        />
      </main>
    </div>
  );
}
