import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { getSupabaseEnv } from './env';

/**
 * Creates a stateless Supabase client for public queries (e.g. properties listing).
 */
export function createServerClient() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Use with caution only for trusted server-side administrative operations.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !serviceKey || serviceKey.includes('your-service-role-key')) {
    return null;
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
