'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { useTranslation } from '@/components/providers';

interface UserMenuProps {
  onNavigate?: () => void;
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { user, userName, userEmail, avatarUrl, provider, role, isAdmin, signOut } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsOpen(false);
      if (onNavigate) onNavigate();
      router.refresh();
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = (userName || userEmail || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const providerLabel =
    provider === 'google'
      ? 'Google'
      : provider === 'github'
      ? 'GitHub'
      : 'Account';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('nav.userProfile')}
        className="group flex items-center focus:outline-none cursor-pointer"
      >
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-transparent group-hover:ring-[#006655] dark:group-hover:ring-[#06f9d0] group-focus:ring-[#006655] dark:group-focus:ring-[#06f9d0] transition-all duration-200 overflow-hidden bg-[#006655]/10 dark:bg-white/10 flex items-center justify-center shadow-xs">
          {avatarUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName || 'User Profile'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-[#006655] dark:text-[#06f9d0]">
              {initials}
            </span>
          )}

          {/* Provider Mini Badge on avatar edge */}
          {provider && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#19322F] flex items-center justify-center shadow-xs border border-[#19322F]/10 dark:border-white/20">
              {provider === 'google' ? (
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5 fill-current text-[#19322F] dark:text-white" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl bg-white dark:bg-[#152e2a] border border-[#19322F]/10 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-lg">
          {/* Header with user info */}
          <div className="p-4 border-b border-[#19322F]/10 dark:border-white/10 bg-[#EEF6F6]/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#006655]/10 dark:bg-white/10 shrink-0 ring-1 ring-[#19322F]/10 dark:ring-white/20 flex items-center justify-center">
                {avatarUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={userName || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#006655] dark:text-[#06f9d0]">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-[#19322F] dark:text-white truncate">
                    {userName || t('auth.guest')}
                  </p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#19322F]/60 dark:text-gray-400 truncate">
                  {userEmail || ''}
                </p>
                {provider && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#006655]/10 dark:bg-white/10 text-[#006655] dark:text-[#06f9d0]">
                    {provider === 'google' ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    )}
                    <span>{providerLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {/* Admin Dashboard shortcut for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) onNavigate();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors border border-purple-200/60 dark:border-purple-800/60 shadow-2xs"
              >
                <span className="material-icons text-lg text-purple-600 dark:text-purple-400">
                  admin_panel_settings
                </span>
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href="/"
              onClick={() => {
                setIsOpen(false);
                if (onNavigate) onNavigate();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#19322F] dark:text-gray-200 hover:bg-[#EEF6F6] dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">
                favorite_border
              </span>
              <span>{t('auth.savedHomes')}</span>
            </Link>

            <Link
              href="/featured"
              onClick={() => {
                setIsOpen(false);
                if (onNavigate) onNavigate();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#19322F] dark:text-gray-200 hover:bg-[#EEF6F6] dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-icons text-lg text-[#006655] dark:text-[#06f9d0]">
                star_outline
              </span>
              <span>{t('nav.featured')}</span>
            </Link>
          </div>

          {/* Sign out action */}
          <div className="p-2 border-t border-[#19322F]/10 dark:border-white/10">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-icons text-lg">logout</span>
              <span>{isSigningOut ? t('auth.signingOut') : t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
