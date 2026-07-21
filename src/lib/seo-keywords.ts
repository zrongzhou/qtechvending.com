/**
 * SEO keyword + hreflang helpers (T13).
 */

/**
 * Build a keyword list from a base set plus locale-specific terms.
 */
export function buildStaticPageKeywords(base: string[], locale?: string): string[] {
  const localized: Record<string, string[]> = {
    en: ['vending machine', 'Qtech', 'self-service', 'automatic equipment'],
    zh: ['智能售货机', 'Qtech', '自动设备', '广州秋彦科技'],
    ar: ['آلة بيع', 'Qtech', 'جهاز أوتوماتيكي', 'معدات البيع الذاتي'],
  };
  const extra = locale ? (localized[locale] ?? []) : [];
  return Array.from(new Set([...base, ...extra]));
}

/**
 * Flatten a stored `seoKeywords` Json value into a locale-appropriate keyword
 * array for the page <meta name="keywords"> tag.
 *
 * Accepts any of these shapes (as produced by the seed pipeline / docx import):
 *   - string                → comma/semicolon split, trimmed
 *   - string[]              → as-is
 *   - { en:[...], zh:[...], ar:[...] }  → pick the requested locale, fall back
 *                                         to en, then any present locale
 *   - { en:"a,b", ... }     → split each string value on commas
 * Returns `null` when there is nothing usable so the caller can fall back to
 * static keywords.
 */
export function seoKeywordList(value: unknown, locale = 'en'): string[] | null {
  if (value == null) return null;

  const splitStr = (s: string): string[] =>
    s.split(/[,;]/).map((x) => x.trim()).filter(Boolean);

  if (typeof value === 'string') {
    const arr = splitStr(value);
    return arr.length ? arr : null;
  }
  if (Array.isArray(value)) {
    const arr = value.filter((x): x is string => typeof x === 'string');
    return arr.length ? arr : null;
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const locales = [locale, 'en', 'zh', 'ar'];
    for (const l of locales) {
      const v = o[l];
      if (v == null) continue;
      if (Array.isArray(v)) {
        const arr = v.filter((x): x is string => typeof x === 'string');
        if (arr.length) return arr;
      } else if (typeof v === 'string') {
        const arr = splitStr(v);
        if (arr.length) return arr;
      }
    }
  }
  return null;
}

/**
 * Build the hreflang alternates object for a given page path (without locale prefix).
 * Both production (www) and staging (test) hosts serve the same bilingual set,
 * so the alternates only reference locale prefixes (resolved per-host by the crawler).
 */
export function buildHreflang(path: string): Record<string, string> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return {
    en: `/en${clean}`,
    'zh-CN': `/zh${clean}`,
    ar: `/ar${clean}`,
    'x-default': `/en${clean}`,
  };
}
