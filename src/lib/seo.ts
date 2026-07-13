import { Metadata } from 'next';
import { headers } from 'next/headers';

/**
 * Centralized SEO helpers for the QtechVending trilingual site.
 *
 * Absolute URLs are derived from NEXT_PUBLIC_BASE_URL (canonical) so canonical /
 * hreflang / og links stay consistent regardless of how the site is accessed
 * (IP, www, or test domain).
 */

export function getBaseUrl(): string {
  const canonicalBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (canonicalBase) {
    return canonicalBase.replace(/\/+$/, '');
  }
  try {
    const headersList = headers();
    const host = headersList.get('host');
    if (host) {
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      return `${protocol}://${host}`;
    }
  } catch {
    // headers() throws in Client Components / during build.
  }
  return '';
}

export const SITE_CONFIG = {
  name: 'Qtech',
  company: 'Guangzhou Qiuyan Technology Co., Ltd.',
  defaultTitle: 'Qtech — Intelligent Vending & Fresh-Flower Automation Equipment',
  defaultTitleZh: 'Qtech — 智能售货与鲜花园艺自动化设备',
  defaultDescription:
    'Qtech (Guangzhou Qiuyan Technology) manufactures intelligent vending machines, fresh-flower vending, and automated garden equipment for global distributors and operators.',
  defaultDescriptionZh:
    'Qtech（广州秋彦科技）为全球经销商与运营商提供智能售货机、鲜花自动售货设备及自动化园艺设备。',
  keywords: [
    'vending machine', 'fresh flower vending', 'vending machine manufacturer',
    'self-service kiosk', 'automatic vending', 'Qtech', 'Qiuyan Technology',
    '智能售货机', '鲜花售货机', '自动售货设备', '广州秋彦科技',
    'م machine بيع', 'آلة بيع ذكية', 'آلة بيع الزهور',
  ],
  ogImage: '/images/og-default.svg',
  twitterHandle: '@qtechvending',
  sameAs: [] as string[],
  email: 'sales@qtechvending.com',
  phone: '+86-20-0000-0000',
};

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
}

export function generatePageMetadata(options: PageSEOOptions): Metadata {
  const { title, description, path, image, type = 'website', publishedTime, modifiedTime, author, noindex = false } = options;
  const baseUrl = getBaseUrl();

  // `title` is the BARE page title. The root layout's `title.template`
  // ("%s | Qtech") appends the site name to the <title> tag, so we must NOT
  // prepend it here (that would double the site name). OG/Twitter titles are
  // not templated, so we build the full display title for them.
  const displayTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.defaultTitle;
  const fullDescription = description || SITE_CONFIG.defaultDescription;
  const ogImageUrl = image
    ? image.startsWith('http')
      ? image
      : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`
    : `${baseUrl}${SITE_CONFIG.ogImage}`;
  const pageUrl = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  // Next.js's Metadata API only accepts a fixed set of OpenGraph `type`
  // values; 'product' is rejected at RUNTIME (throws "Invalid OpenGraph
  // type"). JSON-LD still uses @type: 'Product' (valid), so map the OG type
  // to 'website' here.
  const ogType = type === 'product' ? 'website' : type;

  return {
    title,
    description: fullDescription,
    keywords: options.keywords && options.keywords.length ? options.keywords.join(', ') : SITE_CONFIG.keywords.join(', '),
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title: displayTitle,
      description: fullDescription,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title || SITE_CONFIG.name }],
      locale: 'en_US',
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
      creator: SITE_CONFIG.twitterHandle,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `/en${path}`,
        'zh-CN': `/zh${path}`,
        ar: `/ar${path}`,
        'x-default': `/en${path}`,
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
    description: SITE_CONFIG.defaultDescription,
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
      name: SITE_CONFIG.company,
      ...(baseUrl && { url: baseUrl }),
    },
  };
}

export function jsonLdOrganization(): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.company,
    alternateName: ['广州秋彦科技有限公司', 'Qtech', 'Qiuyan Technology'],
    ...(baseUrl && { url: baseUrl }),
    ...(baseUrl && { logo: `${baseUrl}/images/logo.svg` }),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.phone,
      contactType: 'sales',
      email: SITE_CONFIG.email,
      availableLanguage: ['English', 'Chinese', 'Arabic'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guangzhou',
      addressRegion: 'Guangdong',
      addressCountry: 'CN',
    },
    sameAs: SITE_CONFIG.sameAs || [],
  };
}

export function jsonLdProduct(product: { name: string; description: string; image: string; slug: string; category?: string }): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const imageUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
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

export function jsonLdArticle(post: { title: string; description: string; image: string; slug: string; datePublished: string; dateModified?: string; author?: string }): Record<string, unknown> {
  const baseUrl = getBaseUrl();
  const imageUrl = post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`;
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
      name: SITE_CONFIG.company,
      ...(baseUrl && { logo: { '@type': 'ImageObject', url: `${baseUrl}/images/logo.svg` } }),
    },
  };
}
