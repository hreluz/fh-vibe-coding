export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          address: string;
          area_sq_meters: number;
          badge: string | null;
          bathrooms: number;
          bedrooms: number;
          category: string;
          city: string;
          country: string | null;
          created_at: string;
          description: string | null;
          garage: number | null;
          id: string;
          images: string[] | null;
          image_alt: string | null;
          is_featured: boolean;
          latitude: number | null;
          listing_type: string;
          location_formatted: string;
          longitude: number | null;
          price: number;
          slug: string;
          state: string | null;
          title: string;
          amenities: string[] | null;
        };
        Insert: {
          address?: string;
          area_sq_meters?: number;
          badge?: string | null;
          bathrooms?: number;
          bedrooms?: number;
          category: string;
          city?: string;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          garage?: number | null;
          id?: string;
          images?: string[] | null;
          image_alt?: string | null;
          is_featured?: boolean;
          latitude?: number | null;
          listing_type: string;
          location_formatted: string;
          longitude?: number | null;
          price: number;
          slug: string;
          state?: string | null;
          title: string;
          amenities?: string[] | null;
        };
        Update: {
          address?: string;
          area_sq_meters?: number;
          badge?: string | null;
          bathrooms?: number;
          bedrooms?: number;
          category?: string;
          city?: string;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          garage?: number | null;
          id?: string;
          images?: string[] | null;
          image_alt?: string | null;
          is_featured?: boolean;
          latitude?: number | null;
          listing_type?: string;
          location_formatted?: string;
          longitude?: number | null;
          price?: number;
          slug?: string;
          state?: string | null;
          title?: string;
          amenities?: string[] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
