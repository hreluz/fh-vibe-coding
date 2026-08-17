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
          id: string;
          image_alt: string;
          image_url: string;
          is_featured: boolean;
          listing_type: string;
          location_formatted: string;
          price: number;
          slug: string;
          state: string | null;
          title: string;
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
          id?: string;
          image_alt?: string;
          image_url: string;
          is_featured?: boolean;
          listing_type: string;
          location_formatted: string;
          price: number;
          slug: string;
          state?: string | null;
          title: string;
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
          id?: string;
          image_alt?: string;
          image_url?: string;
          is_featured?: boolean;
          listing_type?: string;
          location_formatted?: string;
          price?: number;
          slug?: string;
          state?: string | null;
          title?: string;
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
