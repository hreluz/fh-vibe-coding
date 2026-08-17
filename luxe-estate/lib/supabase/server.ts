import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { getSupabaseEnv } from './env';

export function createServerClient() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env.local.');
  }

  return createSupabaseClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}
