-- Migration: Add is_active column to properties table
-- Enables soft deactivation of properties to avoid hard database deletions.

-- 1. Add is_active column with default true
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Create index on is_active for efficient filtering
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties (is_active);

-- 3. Composite index for active featured properties lookup
CREATE INDEX IF NOT EXISTS idx_properties_active_featured ON public.properties (is_active, is_featured);
