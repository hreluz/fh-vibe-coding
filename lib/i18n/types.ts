export type Locale = 'en' | 'es' | 'fr' | string;

export interface LocaleConfig {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
}

export type TranslationParams = Record<string, string | number | boolean | undefined | null>;

export type TranslationKey = string;
