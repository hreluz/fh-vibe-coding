'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, Provider } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';

export type OAuthProvider = 'google' | 'github';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  provider: OAuthProvider | null;
  avatarUrl: string | null;
  userName: string | null;
  userEmail: string | null;
  signInWithOAuth: (provider: OAuthProvider, next?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return (
    metadata.avatar_url ||
    metadata.picture ||
    metadata.avatar ||
    (user.identities?.[0]?.identity_data?.avatar_url as string) ||
    (user.identities?.[0]?.identity_data?.picture as string) ||
    null
  );
}

function extractUserName(user: User | null): string | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    (user.identities?.[0]?.identity_data?.full_name as string) ||
    (user.identities?.[0]?.identity_data?.name as string) ||
    user.email?.split('@')[0] ||
    'User'
  );
}

function extractProvider(user: User | null): OAuthProvider | null {
  if (!user) return null;
  const appProvider = user.app_metadata?.provider;
  if (appProvider === 'google' || appProvider === 'github') return appProvider;
  
  const identityProvider = user.identities?.[0]?.provider;
  if (identityProvider === 'google' || identityProvider === 'github') {
    return identityProvider as OAuthProvider;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const env = useMemo(() => getSupabaseEnv(), []);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!env.isConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Fetch initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn('Supabase auth getSession exception:', err);
        setIsLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, env.isConfigured]);

  const signInWithOAuth = useCallback(
    async (oauthProvider: OAuthProvider, next?: string) => {
      if (!env.isConfigured) {
        return {
          error: new Error(
            'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
          ),
        };
      }

      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const targetNext = next || '/';
        const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(targetNext)}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: oauthProvider as Provider,
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        return { error: error ? new Error(error.message) : null };
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err : new Error('Unknown error during sign in'),
        };
      }
    },
    [supabase, env.isConfigured]
  );

  const signOut = useCallback(async () => {
    if (!env.isConfigured) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, [supabase, env.isConfigured]);

  const avatarUrl = useMemo(() => extractAvatarUrl(user), [user]);
  const userName = useMemo(() => extractUserName(user), [user]);
  const userEmail = useMemo(() => user?.email ?? null, [user]);
  const provider = useMemo(() => extractProvider(user), [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      isConfigured: env.isConfigured,
      provider,
      avatarUrl,
      userName,
      userEmail,
      signInWithOAuth,
      signOut,
    }),
    [user, session, isLoading, env.isConfigured, provider, avatarUrl, userName, userEmail, signInWithOAuth, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
