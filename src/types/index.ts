import type { Locale } from '@/lib/i18n';

/** A normalized spec row. `param`/`value` may be a plain string (legacy) or a
 *  localized I18nString so specs render in the active language. */
export interface ProductSpec {
  param: I18nString | string;
  value: I18nString | string;
}

/** Shape of the Prisma `Json` i18n field. */
export interface I18nString {
  en?: string;
  zh?: string;
  ar?: string;
  [key: string]: string | undefined;
}

export interface I18nStringList {
  en?: string[];
  zh?: string[];
  ar?: string[];
  [key: string]: string[] | undefined;
}

/** A single product FAQ entry: a question and answer, each localized. */
export interface FaqItem {
  q: I18nString;
  a: I18nString;
  /** Display / sort order within the product FAQ list. */
  order?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: I18nString;
  icon: string | null;
  description: I18nString | null;
  order: number;
  status: string;
  type: string;
  products?: Product[];
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: I18nString;
  /** Short clean title for H1 display (≤60 chars). Falls back to name if omitted. */
  displayTitle?: I18nString;
  description: I18nString | null;
  shortDescription: I18nString | null;
  images: string[];
  features: I18nStringList | null;
  specs: ProductSpec[] | null;
  status: string;
  featured: boolean;
  order: number;
  relatedProducts: string[];
  categories: Category[];
  /** V49.15: product Q&A entries, localized per language. */
  faq?: FaqItem[] | null;
  /** V49.20: Excel-authored SEO fields (emitted to page meta). */
  seoTitle?: I18nString | null;
  seoDescription?: I18nString | null;
  seoKeywords?: I18nStringList | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: I18nString;
  excerpt: I18nString | null;
  content: I18nString;
  author: string;
  publishedAt: string;
  status: string;
  featured: boolean;
  image: string | null;
  /** V49.20: Excel/docx-authored SEO fields (emitted to page meta). */
  seoTitle?: I18nString | null;
  seoKeywords?: I18nStringList | null;
}

export type ContactSubject = 'general' | 'sales' | 'support' | 'customization' | 'partnership';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  productInterest?: string;
  subject: ContactSubject;
  message: string;
  locale?: Locale;
}

/** Generic API list response envelope. */
export interface Paginated<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/** A single social link used by SiteSetting. */
export interface SocialLink {
  name: string;
  href: string;
}

/**
 * Site-wide settings migrated from the legacy `SITE_CONFIG` constant.
 * Single row identified by `slug = 'main'`. Multi-language fields follow the
 * `{ en, zh, ar }` convention (see I18nString).
 */
export interface SiteSetting {
  id: string;
  slug: string;
  company: I18nString | null;
  email: string;
  phone: string;
  address: I18nString | null;
  addressLine: string | null;
  socials: SocialLink[] | null;
  sameAs: string[] | null;
  ogImage: string | null;
  twitterHandle: string | null;
  keywords: I18nStringList | null;
  defaultTitle: I18nString | null;
  defaultDescription: I18nString | null;
  updatedAt: string;
}

/** A single global FAQ entry (SiteFaqItem). */
export interface SiteFaqItem {
  id: string;
  question: I18nString;
  answer: I18nString;
  faqOrder: number;
}

/** A global FAQ category with its nested items (SiteFaqCategory). */
export interface SiteFaqCategory {
  id: string;
  key: string;
  title: I18nString;
  faqOrder: number;
  items: SiteFaqItem[];
}
