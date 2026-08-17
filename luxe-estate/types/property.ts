export type PropertyCategory = 'house' | 'apartment' | 'villa' | 'penthouse';
export type ListingType = 'for_sale' | 'for_rent';
export type PropertyBadge = 'Exclusive' | 'New Arrival' | 'Featured' | null;

export interface PropertyLocation {
  address: string;
  city: string;
  state?: string;
  country?: string;
  formatted: string;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  areaSqMeters: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: ListingType;
  category: PropertyCategory;
  location: PropertyLocation;
  specs: PropertySpecs;
  imageUrl: string;
  imageAlt: string;
  badge?: PropertyBadge;
  isFeatured?: boolean;
  description?: string;
  createdAt: string;
}

export type CategoryFilterType = 'all' | PropertyCategory;
export type ListingFilterType = 'all' | ListingType;
