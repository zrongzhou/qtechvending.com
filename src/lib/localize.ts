import type { Locale } from './i18n';

/**
 * Resolve a localized string from a Prisma `Json` i18n field shaped as
 * `{ en, zh, ar }`. Falls back to English, then to any present language, then
 * to an empty string so the UI never crashes on missing translations.
 */
export type I18nField = {
  en?: string;
  zh?: string;
  ar?: string;
  [key: string]: string | undefined;
};

export function localized(field: unknown, locale: Locale): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const f = field as I18nField;
    if (f[locale]) return f[locale] as string;
    if (f.en) return f.en as string;
    // fall back to the first defined language
    for (const k of Object.keys(f)) {
      if (f[k]) return f[k] as string;
    }
  }
  return '';
}

/**
 * Resolve a localized string-array field shaped as `{ en: [], zh: [], ar: [] }`.
 */
export function localizedList(field: unknown, locale: Locale): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field as string[];
  if (typeof field === 'object') {
    const f = field as Record<string, string[] | undefined>;
    if (f[locale] && Array.isArray(f[locale])) return f[locale] as string[];
    if (f.en && Array.isArray(f.en)) return f.en as string[];
    for (const k of Object.keys(f)) {
      if (Array.isArray(f[k])) return f[k] as string[];
    }
  }
  return [];
}
