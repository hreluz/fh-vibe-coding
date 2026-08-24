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
import { ALL_PROPERTIES, DEFAULT_AGENT } from '@/data/mock-properties';

export interface GetPaginatedPropertiesOptions {
  page?: number;
  pageSize?: number;
  category?: CategoryFilterType;
  listingType?: ListingFilterType;
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
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

export { matchesPropertyFilters } from './property-filters';
import { matchesPropertyFilters } from './property-filters';

/**
 * Helper to count matching properties in a given array based on filter criteria.
 */
export function countMatchingProperties(
  properties: Property[],
  filters: {
    category?: CategoryFilterType;
    listingType?: ListingFilterType;
    query?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  }
): number {
  return properties.filter((p) => matchesPropertyFilters(p, filters)).length;
}

/**
 * Maps a database row from Supabase to the frontend `Property` interface.
 */
export function mapPropertyRow(row: PropertyRow): Property {
  const mockFallback = ALL_PROPERTIES.find((p) => p.id === row.id || p.slug === row.slug);

  // Parse images array directly from DB or mock data fallback
  let images: string[] = [];
  if (row.images && Array.isArray(row.images) && row.images.length > 0) {
    images = row.images;
  } else if (mockFallback?.images && mockFallback.images.length > 0) {
    images = mockFallback.images;
  } else {
    images = [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ];
  }

  const hasValidDbCoords =
    row.latitude !== null &&
    row.latitude !== undefined &&
    !isNaN(Number(row.latitude)) &&
    row.longitude !== null &&
    row.longitude !== undefined &&
    !isNaN(Number(row.longitude));

  const coordinates = hasValidDbCoords
    ? { lat: Number(row.latitude), lng: Number(row.longitude) }
    : mockFallback?.coordinates || { lat: 34.0736, lng: -118.4004 };

  const amenities =
    row.amenities && Array.isArray(row.amenities) && row.amenities.length > 0
      ? row.amenities
      : mockFallback?.amenities || [
          'Smart Home System',
          'Swimming Pool',
          'Central Heating & Cooling',
          'Electric Vehicle Charging',
          'Private Gym',
          'Wine Cellar',
        ];

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
      garage:
        row.garage !== null && row.garage !== undefined
          ? Number(row.garage)
          : mockFallback?.specs.garage ?? 1,
    },
    images,
    badge: (row.badge as PropertyBadge) || null,
    isFeatured: row.is_featured,
    description: row.description || mockFallback?.description || undefined,
    amenities,
    coordinates,
    agent: DEFAULT_AGENT,
    createdAt: row.created_at,
  };
}

/**
 * Fetches a single property by its slug from Supabase or mock fallback.
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const decodedSlug = decodeURIComponent(slug);
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return ALL_PROPERTIES.find((p) => p.slug === decodedSlug) || null;
  }

  try {
    const supabase = createServerClient();

    const { data: propData, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', decodedSlug)
      .maybeSingle();

    if (propError || !propData) {
      return ALL_PROPERTIES.find((p) => p.slug === decodedSlug) || null;
    }

    return mapPropertyRow(propData);
  } catch (err) {
    console.error('Error fetching property by slug:', err);
    return ALL_PROPERTIES.find((p) => p.slug === decodedSlug) || null;
  }
}

/**
 * Fetches all property slugs for static routes or sitemaps.
 */
export async function getAllPropertySlugs(): Promise<string[]> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return ALL_PROPERTIES.map((p) => p.slug);
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('properties').select('slug');
    if (error || !data) {
      return ALL_PROPERTIES.map((p) => p.slug);
    }
    return data.map((item) => item.slug);
  } catch {
    return ALL_PROPERTIES.map((p) => p.slug);
  }
}

/**
 * Fetches featured properties directly from Supabase on the server.
 */
export async function getFeaturedProperties(options?: {
  category?: CategoryFilterType;
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}): Promise<Property[]> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    const list = ALL_PROPERTIES.filter((p) => p.isFeatured);
    return list.filter((p) =>
      matchesPropertyFilters(p, {
        category: options?.category,
        query: options?.query,
        location: options?.location,
        minPrice: options?.minPrice,
        maxPrice: options?.maxPrice,
        bedrooms: options?.bedrooms,
        bathrooms: options?.bathrooms,
        amenities: options?.amenities,
      })
    );
  }

  try {
    const supabase = createServerClient();
    let query = supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }

    if (options?.minPrice !== undefined && !isNaN(options.minPrice) && options.minPrice > 0) {
      query = query.gte('price', options.minPrice);
    }

    if (options?.maxPrice !== undefined && !isNaN(options.maxPrice) && options.maxPrice > 0) {
      query = query.lte('price', options.maxPrice);
    }

    if (options?.bedrooms !== undefined && !isNaN(options.bedrooms) && options.bedrooms > 0) {
      query = query.gte('bedrooms', options.bedrooms);
    }

    if (options?.bathrooms !== undefined && !isNaN(options.bathrooms) && options.bathrooms > 0) {
      query = query.gte('bathrooms', options.bathrooms);
    }

    if (options?.location && options.location.trim() !== '') {
      const loc = options.location.trim();
      query = query.or(`location_formatted.ilike.%${loc}%,city.ilike.%${loc}%,address.ilike.%${loc}%`);
    }

    if (options?.query && options.query.trim() !== '') {
      const term = options.query.trim();
      query = query.or(`title.ilike.%${term}%,location_formatted.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching featured properties:', error);
      return [];
    }

    let results = (data || []).map((row) => mapPropertyRow(row));

    if (options?.amenities && options.amenities.length > 0) {
      results = results.filter((p) => matchesPropertyFilters(p, { amenities: options.amenities }));
    }

    return results;
  } catch (err) {
    console.error('Error in getFeaturedProperties:', err);
    return [];
  }
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
  location = '',
  minPrice,
  maxPrice,
  bedrooms,
  bathrooms,
  amenities,
  isFeatured = false,
}: GetPaginatedPropertiesOptions = {}): Promise<PaginatedPropertiesResult> {
  const currentPage = Math.max(1, page);
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    let list = ALL_PROPERTIES.filter((p) => (isFeatured ? p.isFeatured : !p.isFeatured));

    list = list.filter((p) =>
      matchesPropertyFilters(p, {
        category,
        listingType,
        query,
        location,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        amenities,
      })
    );

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize);
    const from = (currentPage - 1) * pageSize;
    const properties = list.slice(from, from + pageSize);

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

  try {
    const supabase = createServerClient();

    let dbQuery = supabase.from('properties').select('*', { count: 'exact' });

    if (isFeatured !== undefined) {
      dbQuery = dbQuery.eq('is_featured', isFeatured);
    }

    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (listingType && listingType !== 'all') {
      dbQuery = dbQuery.eq('listing_type', listingType);
    }

    if (minPrice !== undefined && !isNaN(minPrice) && minPrice > 0) {
      dbQuery = dbQuery.gte('price', minPrice);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice) && maxPrice > 0) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    if (bedrooms !== undefined && !isNaN(bedrooms) && bedrooms > 0) {
      dbQuery = dbQuery.gte('bedrooms', bedrooms);
    }

    if (bathrooms !== undefined && !isNaN(bathrooms) && bathrooms > 0) {
      dbQuery = dbQuery.gte('bathrooms', bathrooms);
    }

    if (location && location.trim() !== '') {
      const loc = location.trim();
      dbQuery = dbQuery.or(`location_formatted.ilike.%${loc}%,city.ilike.%${loc}%,address.ilike.%${loc}%`);
    }

    if (query && query.trim() !== '') {
      const term = query.trim();
      dbQuery = dbQuery.or(`title.ilike.%${term}%,location_formatted.ilike.%${term}%,description.ilike.%${term}%`);
    }

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

    let properties = (data || []).map((row) => mapPropertyRow(row));

    if (amenities && amenities.length > 0) {
      properties = properties.filter((p) => matchesPropertyFilters(p, { amenities }));
    }

    const total = count || properties.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      properties,
      total,
      page: currentPage,
      pageSize,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  } catch (err) {
    console.error('Error in getPaginatedProperties:', err);
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

