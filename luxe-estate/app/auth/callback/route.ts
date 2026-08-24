import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createAdminClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/database';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  // Ensure 'next' is a relative path to prevent open redirect vulnerabilities
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (code) {
    const { url, anonKey, isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      let response = NextResponse.redirect(`${origin}${safeNext}`);

      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.redirect(`${origin}${safeNext}`);
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && authData?.user) {
        const user = authData.user;
        const adminClient = createAdminClient();
        const client = adminClient || supabase;

        // Fetch existing role row to strictly preserve whatever role is in the database
        const { data: existingRoleRow } = await client
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        const resolvedRole: UserRole = (existingRoleRow?.role as UserRole) || 'user';

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.user_name ||
          (user.identities?.[0]?.identity_data?.full_name as string) ||
          (user.identities?.[0]?.identity_data?.name as string) ||
          user.email?.split('@')[0] ||
          'User';

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          user.user_metadata?.avatar ||
          (user.identities?.[0]?.identity_data?.avatar_url as string) ||
          (user.identities?.[0]?.identity_data?.picture as string) ||
          null;

        // Upsert user_roles table to keep name, avatar, and email fresh
        const { error: upsertError } = await client.from('user_roles').upsert(
          {
            user_id: user.id,
            email: user.email || '',
            full_name: fullName,
            avatar_url: avatarUrl,
            role: resolvedRole,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (upsertError) {
          console.error('Error syncing user_roles in auth callback:', upsertError.message);
        }

        return response;
      }

      if (error) {
        console.error('Supabase OAuth code exchange error:', error.message);
      }
    }
  }

  // If there was an error or code is missing, redirect to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
