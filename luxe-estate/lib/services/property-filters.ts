import {
  CategoryFilterType,
  ListingFilterType,
  Property,
  PropertyStatusFilter,
} from '@/types/property';

/**
 * Checks whether a single property satisfies the specified filter values.
 * Pure function safe to use in client and server components.
 */
export function matchesPropertyFilters(
  prop: Property,
  filters: {
    category?: CategoryFilterType;
    listingType?: ListingFilterType;
    status?: PropertyStatusFilter;
    isActive?: boolean;
    query?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  }
): boolean {
  const propIsActive = prop.isActive !== false;

  if (filters.isActive !== undefined && propIsActive !== filters.isActive) {
    return false;
  }

  if (filters.status === 'active' && !propIsActive) {
    return false;
  }

  if (filters.status === 'inactive' && propIsActive) {
    return false;
  }

  if (filters.category && filters.category !== 'all' && prop.category !== filters.category) {
    return false;
  }

  if (filters.listingType && filters.listingType !== 'all' && prop.listingType !== filters.listingType) {
    return false;
  }

  if (filters.minPrice !== undefined && !isNaN(filters.minPrice) && filters.minPrice > 0) {
    if (prop.price < filters.minPrice) return false;
  }

  if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice) && filters.maxPrice > 0) {
    if (prop.price > filters.maxPrice) return false;
  }

  if (filters.bedrooms !== undefined && !isNaN(filters.bedrooms) && filters.bedrooms > 0) {
    if (prop.specs.bedrooms < filters.bedrooms) return false;
  }

  if (filters.bathrooms !== undefined && !isNaN(filters.bathrooms) && filters.bathrooms > 0) {
    if (prop.specs.bathrooms < filters.bathrooms) return false;
  }

  if (filters.location && filters.location.trim() !== '') {
    const locTerm = filters.location.toLowerCase().trim();
    const locMatch =
      prop.location.formatted.toLowerCase().includes(locTerm) ||
      prop.location.city.toLowerCase().includes(locTerm) ||
      (prop.location.state && prop.location.state.toLowerCase().includes(locTerm)) ||
      (prop.location.country && prop.location.country.toLowerCase().includes(locTerm)) ||
      prop.location.address.toLowerCase().includes(locTerm);
    if (!locMatch) return false;
  }

  if (filters.query && filters.query.trim() !== '') {
    const qTerm = filters.query.toLowerCase().trim();
    const qMatch =
      prop.title.toLowerCase().includes(qTerm) ||
      prop.location.formatted.toLowerCase().includes(qTerm) ||
      prop.location.city.toLowerCase().includes(qTerm) ||
      (prop.description && prop.description.toLowerCase().includes(qTerm));
    if (!qMatch) return false;
  }

  if (filters.amenities && filters.amenities.length > 0) {
    const propAmenities = (prop.amenities || []).map((a) => a.toLowerCase());
    const hasAllAmenities = filters.amenities.every((reqAmenity) => {
      const lowerReq = reqAmenity.toLowerCase();
      return propAmenities.some((a) => a.includes(lowerReq) || lowerReq.includes(a));
    });
    if (!hasAllAmenities) return false;
  }

  return true;
}
