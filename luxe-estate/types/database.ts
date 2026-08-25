export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = Database['public']['Enums']['user_role'];

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
          is_active: boolean;
          latitude: number | null;
          listing_type: string;
          location_formatted: string;
          longitude: number | null;
          price: number;
          slug: string;
          state: string | null;
          title: string;
          amenities: string[] | null;
          year_built: number | null;
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
          is_active?: boolean;
          latitude?: number | null;
          listing_type: string;
          location_formatted: string;
          longitude?: number | null;
          price: number;
          slug: string;
          state?: string | null;
          title: string;
          amenities?: string[] | null;
          year_built?: number | null;
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
          is_active?: boolean;
          latitude?: number | null;
          listing_type?: string;
          location_formatted?: string;
          longitude?: number | null;
          price?: number;
          slug?: string;
          state?: string | null;
          title?: string;
          amenities?: string[] | null;
          year_built?: number | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: Database['public']['Enums']['user_role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'admin' | 'user';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update'];
