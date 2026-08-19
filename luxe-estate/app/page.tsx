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
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string;
  }>;
}

export default async function Home(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1', 10) || 1;
  const category = (searchParams.category || 'all') as CategoryFilterType;
  const listingType = (searchParams.type || 'all') as ListingFilterType;
  const searchQuery = searchParams.q || '';
  const locationQuery = searchParams.location || '';
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined;
  const bedrooms = searchParams.beds ? parseInt(searchParams.beds, 10) : undefined;
  const bathrooms = searchParams.baths ? parseInt(searchParams.baths, 10) : undefined;
  const amenities = searchParams.amenities
    ? searchParams.amenities.split(',').filter(Boolean)
    : undefined;

  const { isConfigured } = getSupabaseEnv();

  // Check if any filter or search query is currently active
  const hasActiveFilters = Boolean(
    searchQuery ||
    locationQuery ||
    (category && category !== 'all') ||
    (listingType && listingType !== 'all') ||
    (minPrice !== undefined && minPrice > 0) ||
    (maxPrice !== undefined && maxPrice > 0) ||
    (bedrooms !== undefined && bedrooms > 0) ||
    (bathrooms !== undefined && bathrooms > 0) ||
    (amenities && amenities.length > 0)
  );

  // Active Navbar tab
  const activeNavTab =
    listingType === 'for_sale' ? 'Buy' : listingType === 'for_rent' ? 'Rent' : 'Buy';

  const filterOptions = {
    category,
    listingType,
    query: searchQuery,
    location: locationQuery,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    amenities,
  };

  // Fetch data on the server in parallel:
  // 1. Featured properties: Only fetched if no filters/search are applied, capped to max 2 items
  // 2. Paginated properties: Standard server-side pagination with active filters
  const [featuredProperties, paginatedResult] = await Promise.all([
    hasActiveFilters
      ? Promise.resolve([])
      : getFeaturedProperties().then((props) => props.slice(0, 2)),
    getPaginatedProperties({
      page,
      pageSize: 8,
      ...filterOptions,
    }),
  ]);

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

        {/* Featured Collections Section - Only show max 2 properties and only when no filters/search applied */}
        {!hasActiveFilters && featuredProperties.length > 0 && (
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

