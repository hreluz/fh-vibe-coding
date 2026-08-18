import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ALL_PROPERTIES } from '../data/mock-properties';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local or environment.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`🌱 Seeding ${ALL_PROPERTIES.length} properties to Supabase (${supabaseUrl})...`);

  const payload = ALL_PROPERTIES.map((prop) => ({
    id: prop.id,
    title: prop.title,
    slug: prop.slug,
    price: prop.price,
    listing_type: prop.listingType,
    category: prop.category,
    address: prop.location.address || '',
    city: prop.location.city || '',
    state: prop.location.state || null,
    country: prop.location.country || null,
    location_formatted: prop.location.formatted,
    bedrooms: prop.specs.bedrooms,
    bathrooms: prop.specs.bathrooms,
    area_sq_meters: prop.specs.areaSqMeters,
    garage: prop.specs.garage || 1,
    images: prop.images,
    badge: prop.badge || null,
    is_featured: Boolean(prop.isFeatured),
    description: prop.description || null,
    latitude: prop.coordinates?.lat || null,
    longitude: prop.coordinates?.lng || null,
    amenities: prop.amenities || [],
    created_at: prop.createdAt || new Date().toISOString(),
  }));

  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .upsert(payload, { onConflict: 'slug' })
    .select();

  if (propertiesError) {
    console.error('❌ Error seeding properties:', propertiesError.message);
    process.exit(1);
  }

  console.log(`✅ Upserted ${propertiesData?.length ?? payload.length} properties with images array.`);
  console.log('🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('Unhandled seed error:', err);
  process.exit(1);
});
