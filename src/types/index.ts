import type { Locale } from '@/lib/i18n';

/** A normalized spec row: [{ param, value }]. */
export interface ProductSpec {
  param: string;
  value: string;
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
