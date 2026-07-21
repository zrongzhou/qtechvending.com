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
