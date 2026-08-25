import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUserRole } from '@/lib/services/roles';
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/services/properties';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const property = await getPropertyById(id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ property });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch property';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
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

    const updatePayload: Record<string, unknown> = {};

    if (title !== undefined) updatePayload.title = title.trim();
    if (slug !== undefined) updatePayload.slug = slug.trim();
    if (price !== undefined) updatePayload.price = Number(price);
    if (listingType !== undefined) updatePayload.listing_type = listingType;
    if (category !== undefined) updatePayload.category = category;
    if (address !== undefined) updatePayload.address = address?.trim() || '';
    if (city !== undefined) updatePayload.city = city?.trim() || '';
    if (state !== undefined) updatePayload.state = state?.trim() || null;
    if (country !== undefined) updatePayload.country = country?.trim() || null;
    if (locationFormatted !== undefined) {
      updatePayload.location_formatted = locationFormatted?.trim();
    } else if (address || city || state || country) {
      updatePayload.location_formatted = [address, city, state, country].filter(Boolean).join(', ');
    }
    if (bedrooms !== undefined) updatePayload.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updatePayload.bathrooms = Number(bathrooms);
    if (areaSqMeters !== undefined) updatePayload.area_sq_meters = Number(areaSqMeters);
    if (garage !== undefined) updatePayload.garage = Number(garage);
    if (yearBuilt !== undefined) {
      updatePayload.year_built = yearBuilt !== null && !isNaN(Number(yearBuilt)) ? Number(yearBuilt) : null;
    }
    if (images !== undefined && Array.isArray(images)) updatePayload.images = images;
    if (badge !== undefined) updatePayload.badge = badge || null;
    if (isFeatured !== undefined) updatePayload.is_featured = Boolean(isFeatured);
    if (description !== undefined) updatePayload.description = description?.trim() || null;
    if (amenities !== undefined && Array.isArray(amenities)) updatePayload.amenities = amenities;
    if (latitude !== undefined) {
      updatePayload.latitude = latitude !== null && !isNaN(Number(latitude)) ? Number(latitude) : null;
    }
    if (longitude !== undefined) {
      updatePayload.longitude = longitude !== null && !isNaN(Number(longitude)) ? Number(longitude) : null;
    }

    const result = await updateProperty(id, updatePayload);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update property' }, { status: 400 });
    }

    return NextResponse.json({ success: true, property: result.property });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update property';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const result = await deleteProperty(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to delete property' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete property';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
