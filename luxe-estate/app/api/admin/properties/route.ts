import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUserRole, togglePropertyFeatured } from '@/lib/services/roles';
import { getPaginatedProperties } from '@/lib/services/properties';
import { CategoryFilterType, ListingFilterType } from '@/types/property';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const category = (searchParams.get('category') as CategoryFilterType) || 'all';
    const listingType = (searchParams.get('listingType') as ListingFilterType) || 'all';
    const featuredParam = searchParams.get('featured') || 'all';
    const isFeatured =
      featuredParam === 'featured_only'
        ? true
        : featuredParam === 'standard_only'
        ? false
        : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const data = await getPaginatedProperties({
      page,
      pageSize,
      query,
      category,
      listingType,
      isFeatured,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin properties';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, isFeatured } = body;

    if (!propertyId || typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing propertyId or isFeatured boolean in request body' },
        { status: 400 }
      );
    }

    const result = await togglePropertyFeatured(propertyId, isFeatured);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, propertyId, isFeatured });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update property';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      price,
      listingType,
      category,
      address,
      city,
      state,
      country,
      locationFormatted,
      bedrooms,
      bathrooms,
      areaSqMeters,
      garage,
      yearBuilt,
      images,
      badge,
      isFeatured,
      description,
      amenities,
      latitude,
      longitude,
      slug,
    } = body;

    if (!title || price === undefined || !listingType || !category) {
      return NextResponse.json(
        { error: 'Title, price, listingType, and category are required' },
        { status: 400 }
      );
    }

    const { createProperty } = await import('@/lib/services/properties');

    const result = await createProperty({
      title: title.trim(),
      slug: slug?.trim() || undefined,
      price: Number(price),
      listing_type: listingType,
      category,
      address: address?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || null,
      country: country?.trim() || null,
      location_formatted:
        locationFormatted?.trim() ||
        [address, city, state, country].filter(Boolean).join(', ') ||
        'Location not specified',
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : 1,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : 1,
      area_sq_meters: areaSqMeters !== undefined ? Number(areaSqMeters) : 0,
      garage: garage !== undefined ? Number(garage) : 0,
      year_built: yearBuilt !== undefined && yearBuilt !== null && !isNaN(Number(yearBuilt)) ? Number(yearBuilt) : null,
      images: Array.isArray(images) ? images : [],
      badge: badge || null,
      is_featured: Boolean(isFeatured),
      description: description?.trim() || null,
      amenities: Array.isArray(amenities) ? amenities : [],
      latitude: latitude !== undefined && latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : null,
      longitude: longitude !== undefined && longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to create property' }, { status: 400 });
    }

    return NextResponse.json({ success: true, property: result.property }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create property';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

