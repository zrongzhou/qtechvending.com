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
