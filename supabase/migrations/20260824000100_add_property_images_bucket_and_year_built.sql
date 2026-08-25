-- 1. Create the storage bucket 'property-images' if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10 MB per file limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

-- 2. Storage RLS Policies
-- Allow public viewing of all property images
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

-- Allow authenticated users / admins to upload images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Allow anon upload for development environments if unauthenticated
DROP POLICY IF EXISTS "Anon can upload property images for dev" ON storage.objects;
CREATE POLICY "Anon can upload property images for dev" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'property-images');

-- Allow update and deletion of property images
DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
CREATE POLICY "Admins can update property images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Service role full access on storage" ON storage.objects;
CREATE POLICY "Service role full access on storage" ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

-- 3. Add year_built column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS year_built INTEGER;

-- Add index on year_built if queries filter by it
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON public.properties (year_built);
