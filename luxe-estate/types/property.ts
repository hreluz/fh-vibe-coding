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
  garage?: number;
}

export interface PropertyAgent {
  name: string;
  title: string;
  avatarUrl: string;
  phone?: string;
  email?: string;
  rating?: number;
}

export interface PropertyCoordinates {
  lat: number;
  lng: number;
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
  images: string[];
  badge?: PropertyBadge;
  isFeatured?: boolean;
  description?: string;
  amenities?: string[];
  coordinates?: PropertyCoordinates;
  agent?: PropertyAgent;
  createdAt: string;
}

export type CategoryFilterType = 'all' | PropertyCategory;
export type ListingFilterType = 'all' | ListingType;

export interface PropertyFilterValues {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: CategoryFilterType;
  listingType?: ListingFilterType;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  query?: string;
}

