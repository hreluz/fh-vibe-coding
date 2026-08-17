import { createServerClient } from '@/lib/supabase/server';
import { PropertyRow } from '@/types/database';
import {
  CategoryFilterType,
  ListingFilterType,
  ListingType,
  Property,
  PropertyBadge,
  PropertyCategory,
} from '@/types/property';
import { getSupabaseEnv } from '@/lib/supabase/env';

export interface GetPaginatedPropertiesOptions {
  page?: number;
  pageSize?: number;
  category?: CategoryFilterType;
  listingType?: ListingFilterType;
  query?: string;
  isFeatured?: boolean;
}

export interface PaginatedPropertiesResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

/**
 * Maps a database row from Supabase to the frontend `Property` interface.
 */
export function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    listingType: row.listing_type as ListingType,
    category: row.category as PropertyCategory,
    location: {
      address: row.address,
      city: row.city,
      state: row.state || undefined,
      country: row.country || undefined,
      formatted: row.location_formatted,
    },
    specs: {
      bedrooms: row.bedrooms,
      bathrooms: Number(row.bathrooms),
      areaSqMeters: Number(row.area_sq_meters),
    },
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    badge: (row.badge as PropertyBadge) || null,
    isFeatured: row.is_featured,
    description: row.description || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Fetches featured properties directly from Supabase on the server.
 */
export async function getFeaturedProperties(options?: {
  category?: CategoryFilterType;
  query?: string;
}): Promise<Property[]> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return [];
  }

  const supabase = createServerClient();
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  if (options?.query && options.query.trim() !== '') {
    const term = options.query.trim();
    query = query.or(`title.ilike.%${term}%,location_formatted.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }

  return (data || []).map(mapPropertyRow);
}

/**
 * Fetches paginated properties from Supabase with search, category, and listing filters.
 */
export async function getPaginatedProperties({
  page = 1,
  pageSize = 8,
  category = 'all',
  listingType = 'all',
  query = '',
  isFeatured = false,
}: GetPaginatedPropertiesOptions = {}): Promise<PaginatedPropertiesResult> {
  const currentPage = Math.max(1, page);
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return {
      properties: [],
      total: 0,
      page: currentPage,
      pageSize,
      totalPages: 0,
      hasPrevPage: false,
      hasNextPage: false,
    };
  }

  const supabase = createServerClient();

  let dbQuery = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // Only filter out featured if explicitly specified
  if (isFeatured !== undefined) {
    dbQuery = dbQuery.eq('is_featured', isFeatured);
  }

  // Filter by category
  if (category && category !== 'all') {
    dbQuery = dbQuery.eq('category', category);
  }

  // Filter by listing type (for_sale vs for_rent)
  if (listingType && listingType !== 'all') {
    dbQuery = dbQuery.eq('listing_type', listingType);
  }

  // Search by title or location
  if (query && query.trim() !== '') {
    const term = query.trim();
    dbQuery = dbQuery.or(`title.ilike.%${term}%,location_formatted.ilike.%${term}%`);
  }

  // Sort by newest first
  dbQuery = dbQuery.order('created_at', { ascending: false });

  // Range calculation (0-indexed)
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  dbQuery = dbQuery.range(from, to);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.error('Error fetching paginated properties:', error);
    return {
      properties: [],
      total: 0,
      page: currentPage,
      pageSize,
      totalPages: 0,
      hasPrevPage: false,
      hasNextPage: false,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);
  const properties = (data || []).map(mapPropertyRow);

  return {
    properties,
    total,
    page: currentPage,
    pageSize,
    totalPages,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

/**
 * Fetches paginated featured properties directly from Supabase on the server.
 */
export async function getFeaturedPaginatedProperties(
  options: Omit<GetPaginatedPropertiesOptions, 'isFeatured'> = {}
): Promise<PaginatedPropertiesResult> {
  return getPaginatedProperties({
    ...options,
    isFeatured: true,
  });
}

