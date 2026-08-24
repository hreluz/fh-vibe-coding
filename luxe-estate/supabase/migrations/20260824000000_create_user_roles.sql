-- Create user_role ENUM type
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_unique UNIQUE (user_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.user_role
  );
$$;

-- RLS Policies:
-- 1. Users can read their own user_role record
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Admins can read all user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 3. Admins can update user_roles
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Service role has full access
DROP POLICY IF EXISTS "Service role full access on user_roles" ON public.user_roles;
CREATE POLICY "Service role full access on user_roles"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger function to automatically insert/update public.user_roles when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_email TEXT;
BEGIN
  v_email := COALESCE(NEW.email, '');
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(v_email, '@', 1)
  );
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'avatar'
  );

  INSERT INTO public.user_roles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    v_email,
    v_full_name,
    v_avatar_url,
    'user'::public.user_role
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_roles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_roles.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to keep updated_at timestamp current on manual updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill existing users in auth.users into public.user_roles
INSERT INTO public.user_roles (user_id, email, full_name, avatar_url, role)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'user_name',
    split_part(COALESCE(email, ''), '@', 1)
  ),
  COALESCE(
    raw_user_meta_data->>'avatar_url',
    raw_user_meta_data->>'picture',
    raw_user_meta_data->>'avatar'
  ),
  'user'::public.user_role
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
