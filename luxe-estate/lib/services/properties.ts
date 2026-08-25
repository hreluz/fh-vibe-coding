import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { PropertyRow, PropertyInsert, PropertyUpdate } from '@/types/database';
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
      yearBuilt:
        row.year_built !== null && row.year_built !== undefined
          ? Number(row.year_built)
          : mockFallback?.specs.yearBuilt,
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
  isFeatured,
}: GetPaginatedPropertiesOptions = {}): Promise<PaginatedPropertiesResult> {
  const currentPage = Math.max(1, page);
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    let list = isFeatured !== undefined
      ? ALL_PROPERTIES.filter((p) => (isFeatured ? p.isFeatured : !p.isFeatured))
      : ALL_PROPERTIES;

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

/**
 * Fetches a single property by its unique ID.
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return ALL_PROPERTIES.find((p) => p.id === id) || null;
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      // Fallback to mock data if not in DB
      return ALL_PROPERTIES.find((p) => p.id === id) || null;
    }

    return mapPropertyRow(data);
  } catch (err) {
    console.error('Error in getPropertyById:', err);
    return ALL_PROPERTIES.find((p) => p.id === id) || null;
  }
}

/**
 * Helper to generate a URL-safe unique slug from a property title.
 */
export async function generateUniqueSlug(title: string, currentId?: string): Promise<string> {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'property';

  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    let candidate = base;
    let counter = 1;
    while (ALL_PROPERTIES.some((p) => p.slug === candidate && p.id !== currentId)) {
      candidate = `${base}-${counter}`;
      counter++;
    }
    return candidate;
  }

  try {
    const supabase = createServerClient();
    let candidate = base;
    let counter = 1;
    let isUnique = false;

    while (!isUnique && counter <= 50) {
      let query = supabase.from('properties').select('id').eq('slug', candidate);
      if (currentId) {
        query = query.neq('id', currentId);
      }
      const { data } = await query.maybeSingle();
      if (!data) {
        isUnique = true;
      } else {
        candidate = `${base}-${counter}`;
        counter++;
      }
    }

    return isUnique ? candidate : `${base}-${Date.now().toString(36)}`;
  } catch (err) {
    console.error('Error generating unique slug:', err);
    return `${base}-${Date.now().toString(36)}`;
  }
}

/**
 * Creates a new property listing in Supabase.
 */
export async function createProperty(
  input: PropertyInsert
): Promise<{ success: boolean; property?: Property; error?: string }> {
  const { isConfigured } = getSupabaseEnv();

  // Validate required fields
  if (!input.title || !input.price || !input.category || !input.listing_type) {
    return { success: false, error: 'Missing required property fields (title, price, category, listing_type)' };
  }

  const slug = input.slug || (await generateUniqueSlug(input.title));
  const locationFormatted =
    input.location_formatted ||
    [input.address, input.city, input.state, input.country].filter(Boolean).join(', ') ||
    'Location not specified';

  const insertData: PropertyInsert = {
    ...input,
    slug,
    location_formatted: locationFormatted,
    created_at: new Date().toISOString(),
  };

  if (!isConfigured) {
    // Demo / fallback mode
    const fakeId = `prop-${Date.now()}`;
    const newProp: Property = {
      id: fakeId,
      title: insertData.title || '',
      slug,
      price: Number(insertData.price),
      listingType: insertData.listing_type as ListingType,
      category: insertData.category as PropertyCategory,
      location: {
        address: insertData.address || '',
        city: insertData.city || '',
        state: insertData.state || undefined,
        country: insertData.country || undefined,
        formatted: locationFormatted,
      },
      specs: {
        bedrooms: insertData.bedrooms || 1,
        bathrooms: insertData.bathrooms || 1,
        areaSqMeters: insertData.area_sq_meters || 100,
        garage: insertData.garage || 0,
        yearBuilt: insertData.year_built || undefined,
      },
      images: insertData.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      badge: (insertData.badge as PropertyBadge) || null,
      isFeatured: insertData.is_featured || false,
      description: insertData.description || undefined,
      amenities: insertData.amenities || [],
      coordinates:
        insertData.latitude && insertData.longitude
          ? { lat: Number(insertData.latitude), lng: Number(insertData.longitude) }
          : { lat: 34.0736, lng: -118.4004 },
      agent: DEFAULT_AGENT,
      createdAt: insertData.created_at || new Date().toISOString(),
    };
    return { success: true, property: newProp };
  }

  try {
    const adminClient = createAdminClient();
    const supabase = adminClient || createServerClient();

    const { data, error } = await supabase
      .from('properties')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting property:', error);
      return { success: false, error: error.message };
    }

    return { success: true, property: mapPropertyRow(data) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create property';
    console.error('Exception in createProperty:', message);
    return { success: false, error: message };
  }
}

/**
 * Updates an existing property listing in Supabase.
 */
export async function updateProperty(
  id: string,
  input: PropertyUpdate
): Promise<{ success: boolean; property?: Property; error?: string }> {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return { success: true };
  }

  try {
    const adminClient = createAdminClient();
    const supabase = adminClient || createServerClient();

    // Auto-update formatted location if address fields changed
    const updateData: PropertyUpdate = { ...input };
    if (input.address !== undefined || input.city !== undefined || input.state !== undefined || input.country !== undefined) {
      const parts = [input.address, input.city, input.state, input.country].filter(Boolean);
      if (parts.length > 0) {
        updateData.location_formatted = parts.join(', ');
      }
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating property:', error);
      return { success: false, error: error.message };
    }

    return { success: true, property: mapPropertyRow(data) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update property';
    console.error('Exception in updateProperty:', message);
    return { success: false, error: message };
  }
}

/**
 * Deletes a property listing in Supabase.
 */
export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return { success: true };
  }

  try {
    const adminClient = createAdminClient();
    const supabase = adminClient || createServerClient();

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete property';
    console.error('Exception in deleteProperty:', message);
    return { success: false, error: message };
  }
}


