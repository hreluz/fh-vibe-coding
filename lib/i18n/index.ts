import { getValidLocale } from './config';
import { TranslationKey, TranslationParams } from './types';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

export * from './types';
export * from './config';

export const translations: Record<string, Record<string, any>> = {
  en,
  es,
  fr,
};

/**
 * Access nested properties in a JSON dictionary with fallback to English
 */
export function getTranslation(
  locale: string,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const validLocale = getValidLocale(locale);
  const dict = translations[validLocale] || translations.en;
  const fallbackDict = translations.en;

  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  };

  let value = getNestedValue(dict, key);
  if (value === undefined || value === null) {
    value = getNestedValue(fallbackDict, key);
  }

  if (value === undefined || value === null) {
    // If still missing, return the key itself as a friendly fallback
    return key;
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  // Parameter interpolation: replace {{key}} or {key} with param value
  if (params) {
    let interpolated = value;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      if (paramValue !== undefined && paramValue !== null) {
        const regexDouble = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
        const regexSingle = new RegExp(`{\\s*${paramKey}\\s*}`, 'g');
        interpolated = interpolated
          .replace(regexDouble, String(paramValue))
          .replace(regexSingle, String(paramValue));
      }
    }
    return interpolated;
  }

  return value;
}
