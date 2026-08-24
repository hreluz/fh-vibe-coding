import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/supabase/env';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.nextUrl.origin;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  // If Supabase is not configured, redirect to login with error
  if (!isConfigured) {
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 503 }
      );
    }
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. Verify authenticated user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Query public.user_roles table directly as the 100% source of truth
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError || !roleData || roleData.role !== 'admin') {
    if (isAdminApiRoute) {
      return NextResponse.json(
        { error: 'Forbidden: Administrator privileges required' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/unauthorized', origin));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
