'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getValidLocale,
  getLocaleConfig,
  setLocaleCookie,
  getLocaleCookie,
  getTranslation,
  LocaleConfig,
  TranslationKey,
  TranslationParams,
} from '@/lib/i18n';

interface LanguageContextType {
  locale: string;
  currentLocale: LocaleConfig;
  locales: LocaleConfig[];
  setLocale: (locale: string) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<string>(() => {
    return getValidLocale(initialLocale);
  });

  // Check client cookie on mount if initialLocale was default
  useEffect(() => {
    const saved = getLocaleCookie();
    if (saved && getValidLocale(saved) !== locale) {
      setLocaleState(getValidLocale(saved));
    }
  }, []);

  // Update html lang attribute whenever locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: string) => {
    const valid = getValidLocale(newLocale);
    setLocaleState(valid);
    setLocaleCookie(valid);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = valid;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('luxe_locale_change', { detail: valid })
      );
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );

  const currentLocale = useMemo(() => getLocaleConfig(locale), [locale]);

  const contextValue = useMemo(
    () => ({
      locale,
      currentLocale,
      locales: SUPPORTED_LOCALES,
      setLocale,
      t,
    }),
    [locale, currentLocale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;
