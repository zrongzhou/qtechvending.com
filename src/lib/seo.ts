import { Metadata } from 'next';
import { SITE_CONFIG as LEGACY_SITE_CONFIG } from './site-config';
import { getSiteSetting } from './data';

// Re-export the canonical site config so existing `import { SITE_CONFIG } from '@/lib/seo'`
// callers keep working after the constant moved to ./site-config.
export const SITE_CONFIG = LEGACY_SITE_CONFIG;

/**
 * Centralized SEO helpers for the QtechVending trilingual site.
 *
 * Absolute URLs are derived from NEXT_PUBLIC_BASE_URL (canonical) so canonical /
 * hreflang / og links stay consistent regardless of how the site is accessed
 * (IP, www, or test domain).
 *
 * Site-wide defaults (title / description / keywords / ogImage / twitter) are
 * resolved from the DB-backed `SiteSetting` (via `getSiteSetting`) and degrade
 * to the legacy `SITE_CONFIG` constant when the database is unavailable.
 */
export function getBaseUrl(): string {
  // R2 (T06, 门控 2): the previous `headers()` fallback forced every page that
  // calls this into dynamic rendering, which silently blocked ISR for the whole
  // site. We now resolve the canonical base *only* from NEXT_PUBLIC_BASE_URL so
  // the render mode is deterministic and independent of request headers. When
  // the env var is unset we return '' (callers already guard with `baseUrl &&`).
  const canonicalBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (canonicalBase) {
    return canonicalBase.replace(/\/+$/, '');
  }
  return '';
}

interface PageSEOOptions {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
  /** Active locale (en | zh | ar). Used to localize the canonical/og:url,
   *  hreflang alternates, the metadata title/description/keywords, and (for
   *  the static marketing routes) the page <title>. */
  locale: string;
}

/**
 * Locale-aware titles for the static marketing routes. These pages previously
 * emitted a hardcoded English <title>; S-04 switches them to the visitor's
 * locale. Keyed by the `path` passed to `generatePageMetadata` so the function
 * can pick the right language without the caller threading a `t()` helper.
 */
const STATIC_TITLES: Record<string, { en: string; zh: string; ar: string }> = {
  '/about': {
    en: 'About Qtech Vending | Smart Vending Machine Manufacturer',
    zh: '关于 Qtech 智能售货机 | 自助售卖设备制造商',
    ar: 'حول Qtech للبيع الذكي | مصنّع لآلات البيع الذكية',
  },
  '/products': {
    en: 'Products',
    zh: '产品',
    ar: 'المنتجات',
  },
  '/solutions': {
    en: 'Solutions',
    zh: '解决方案',
    ar: 'الحلول',
  },
  '/contact': {
    en: 'Contact',
    zh: '联系我们',
    ar: 'اتصل بنا',
  },
  '/faq': {
    en: 'FAQ',
    zh: '常见问题',
    ar: 'الأسئلة الشائعة',
  },
  '/blog': {
    en: 'Blog',
    zh: '博客',
    ar: 'المدونة',
  },
};

export async function generatePageMetadata(options: PageSEOOptions): Promise<Metadata> {
  const {
    title,
    description,
    path,
    image,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
    locale,
  } = options;
  const baseUrl = getBaseUrl();

  // Resolve site-wide defaults from the DB-backed SiteSetting (degrades to SITE_CONFIG).
  const setting = await getSiteSetting();
  const siteName = SITE_CONFIG.name;
  // S-03: resolve the site-wide defaults in the active locale, falling back to
  // the English copy (and finally the legacy constant) for safety.
  const defaultTitle = setting.defaultTitle?.[locale] || setting.defaultTitle?.en || LEGACY_SITE_CONFIG.defaultTitle;
  const defaultDescription =
    setting.defaultDescription?.[locale] || setting.defaultDescription?.en || LEGACY_SITE_CONFIG.defaultDescription;
  const ogImage = setting.ogImage || LEGACY_SITE_CONFIG.ogImage;
  const twitterHandle = setting.twitterHandle || LEGACY_SITE_CONFIG.twitterHandle;
  const keywordList = setting.keywords?.[locale] || setting.keywords?.en || LEGACY_SITE_CONFIG.keywords;

  // `title` is the BARE page title. The root layout's `title.template`
  // ("%s | Qtech") appends the site name to the <title> tag, so we must NOT
  // prepend it here (that would double the site name). OG/Twitter titles are
  // not templated, so we build the full display title for them.
  // S-04: for the static marketing routes (about/products/solutions/contact/
  // faq/blog) the caller no longer passes an English title — pick the
  // locale-aware title from STATIC_TITLES. Dynamic routes (product/category/
  // blog-detail) still pass their own already-localized title.
  const staticEntry = STATIC_TITLES[path];
  const staticTitle = staticEntry
    ? staticEntry[locale as 'en' | 'zh' | 'ar'] || staticEntry.en
    : undefined;
  const effectiveTitle = title || staticTitle;
  const displayTitle = effectiveTitle ? `${effectiveTitle} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const ogImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`
    : `${baseUrl}${ogImage}`;
  // S-01: every canonical/og:url must include the locale segment so each
  // language variant points at its own URL (e.g. /en/about, /zh/about).
  const normalizedPath = path === '/' ? '' : path;
  const pageUrl = path.startsWith('http')
    ? path
    : `${baseUrl}/${locale}${normalizedPath || ''}`;

  // Next.js's Metadata API only accepts a fixed set of OpenGraph `type`
  // values; 'product' is rejected at RUNTIME (throws "Invalid OpenGraph
  // type"). JSON-LD still uses @type: 'Product' (valid), so map the OG type
  // to 'website' here.
  const ogType = type === 'product' ? 'website' : type;

  return {
    title: effectiveTitle,
    description: fullDescription,
    keywords:
      options.keywords && options.keywords.length
        ? options.keywords.join(', ')
        : keywordList.join(', '),
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title: displayTitle,
      description: fullDescription,
      url: pageUrl,
      siteName,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: effectiveTitle || siteName }],
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ar' ? 'ar' : 'en_US',
      alternateLocale: ['zh_CN', 'ar'],
      type: ogType as 'website' | 'article',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: fullDescription,
      images: [ogImageUrl],
      creator: twitterHandle,
    },
    alternates: {
      canonical: pageUrl,
      // S-01: emit absolute hreflang alternates for every locale plus an
      // x-default that points at the English variant (which is also the
      // canonical URL for the en locale, keeping the set self-consistent).
      languages: {
        en: `${baseUrl}/en${normalizedPath || ''}`,
        'zh-CN': `${baseUrl}/zh${normalizedPath || ''}`,
        ar: `${baseUrl}/ar${normalizedPath || ''}`,
        'x-default': `${baseUrl}/en${normalizedPath || ''}`,
      },
    },
  };
}

export function jsonLdWebsite(): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    ...(baseUrl && { url: baseUrl }),
    description: LEGACY_SITE_CONFIG.defaultDescription,
    inLanguage: ['en', 'zh', 'ar'],
    ...(baseUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/en/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: LEGACY_SITE_CONFIG.company,
      ...(baseUrl && { url: baseUrl }),
    },
  };
}

export async function jsonLdOrganization(): Promise<Record<string, unknown>> {
  const baseUrl = getBaseUrl();
  const setting = await getSiteSetting();
  const companyName = setting.company?.en || LEGACY_SITE_CONFIG.company;
  const phone = setting.phone || LEGACY_SITE_CONFIG.phone;
  const email = setting.email || LEGACY_SITE_CONFIG.email;
  const sameAs = setting.sameAs && setting.sameAs.length ? setting.sameAs : LEGACY_SITE_CONFIG.sameAs;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    alternateName: ['广州秋彦科技有限公司', 'Qtech', 'Qiuyan Technology'],
    ...(baseUrl && { url: baseUrl }),
    ...(baseUrl && { logo: `${baseUrl}/images/logo.svg` }),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'sales',
      email,
      availableLanguage: ['English', 'Chinese', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guangzhou',
      addressRegion: 'Guangdong',
      addressCountry: 'CN',
    },
    sameAs: sameAs || [],
  };
}

export function jsonLdProduct(product: {
  name: string;
  description: string;
  image: string;
  slug: string;
  category?: string;
}): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl,
    ...(baseUrl && { url: `${baseUrl}/en/products/${product.slug}` }),
    brand: { '@type': 'Brand', name: SITE_CONFIG.name },
    ...(product.category && { category: product.category }),
  };
}

export function jsonLdBreadcrumb(items: { name: string; url: string }[]): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export function jsonLdArticle(post: {
  title: string;
  description: string;
  image: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const imageUrl = post.image.startsWith('http')
    ? post.image
    : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    ...(baseUrl && { url: `${baseUrl}/en/blog/${post.slug}` }),
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Person', name: post.author || 'Qtech Team' },
    publisher: {
      '@type': 'Organization',
      name: LEGACY_SITE_CONFIG.company,
      ...(baseUrl && { logo: { '@type': 'ImageObject', url: `${baseUrl}/images/logo.svg` } }),
    },
  };
}
