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
