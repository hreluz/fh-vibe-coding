import { LocaleConfig } from './types';

export const DEFAULT_LOCALE = 'en';
export const COOKIE_NAME = 'luxe_locale';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    label: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
];

export function isValidLocale(locale?: string | null): boolean {
  if (!locale) return false;
  return SUPPORTED_LOCALES.some((l) => l.code.toLowerCase() === locale.toLowerCase());
}

export function getValidLocale(locale?: string | null): string {
  if (isValidLocale(locale)) {
    return locale!.toLowerCase();
  }
  return DEFAULT_LOCALE;
}

export function getLocaleConfig(locale: string): LocaleConfig {
  const valid = getValidLocale(locale);
  return (
    SUPPORTED_LOCALES.find((l) => l.code === valid) ||
    SUPPORTED_LOCALES[0]
  );
}

/**
 * Client-side cookie setter with secure, lax, and long expiration attributes
 */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const valid = getValidLocale(locale);
  document.cookie = `${COOKIE_NAME}=${valid}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Client-side cookie getter
 */
export function getLocaleCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${COOKIE_NAME})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}
