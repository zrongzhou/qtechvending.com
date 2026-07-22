import { prisma } from './prisma';
import { SITE_CONFIG } from './site-config';
import { FAQ_CATEGORIES } from './faq-data';
import type {
  Product,
  BlogPost,
  Category,
  Paginated,
  ProductSpec,
  SiteSetting,
  SiteFaqCategory,
  SiteFaqItem,
  I18nString,
} from '@/types';

/**
 * Server-only data access layer. All functions use the singleton Prisma client.
 * Pages that call these are marked `dynamic = 'force-dynamic'` so they are
 * rendered on demand (no build-time DB connection required).
 *
 * Every function is wrapped in try/catch so that a missing / unreachable
 * database degrades gracefully to empty data (the page shell still renders
 * with HTTP 200) instead of throwing and producing a hard HTTP 500. This is
 * required during the deploy window (app up, DB not yet migrated/seeded) and
 * for any transient DB outage.
 */

function logDataError(fn: string, err: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[data] ${fn} failed:`, err);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const cats = await prisma.category.findMany({
      where: { status: 'active', type: 'product' },
      orderBy: [{ order: 'asc' }, { slug: 'asc' }],
    });
    return cats as unknown as Category[];
  } catch (err) {
    logDataError('getCategories', err);
    return [];
  }
}

/**
 * Number of active products in each category, keyed by category slug.
 * Used by the home CategoriesGrid to show a product count per card.
 */
export async function getCategoryProductCounts(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.category.findMany({
      where: { status: 'active', type: 'product' },
      select: { slug: true, _count: { select: { products: true } } },
    });
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[r.slug] = r._count.products;
    }
    return map;
  } catch (err) {
    logDataError('getCategoryProductCounts', err);
    return {};
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      take: limit,
      include: { categories: true },
    });
    return products as unknown as Product[];
  } catch (err) {
    logDataError('getFeaturedProducts', err);
    return [];
  }
}

export interface ProductQuery {
  categories?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: 'featured' | 'newest' | 'name';
}

function emptyPaginated<T>(page: number, pageSize: number): Paginated<T> {
  return { data: [], total: 0, totalPages: 1, page, pageSize };
}

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  const { categories, search, page = 1, pageSize = 9, sort = 'featured' } = query;
  try {
    const where: Record<string, unknown> = { status: 'active' };
    if (categories && categories.length > 0) {
      where.categories = { some: { slug: { in: categories } } };
    }

    const orderBy: Record<string, unknown>[] =
      sort === 'newest'
        ? [{ createdAt: 'desc' }]
        : sort === 'name'
          ? [{ sku: 'asc' }]
          : [{ featured: 'desc' }, { order: 'asc' }];

    // Search by English product name. The catalog is small, so for search we
    // fetch + filter in JS to avoid Postgres JSON-path filter edge cases.
    if (search && search.trim()) {
      const all = await prisma.product.findMany({
        where,
        orderBy,
        include: { categories: true },
      });
      const needle = search.trim().toLowerCase();
      const filtered = (all as unknown as Product[]).filter((p) => {
        const en = (p.name && typeof p.name === 'object' ? (p.name as Record<string, string>).en : '') || '';
        return en.toLowerCase().includes(needle);
      });
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        page,
        pageSize,
      };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { categories: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: items as unknown as Product[],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    };
  } catch (err) {
    logDataError('getProducts', err);
    return emptyPaginated<Product>(page, pageSize);
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: 'active' },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch (err) {
    logDataError('getAllProductSlugs', err);
    return [];
  }
}

/**
 * Slugs may be stored URL-encoded (e.g. blog slugs containing emoji / CJK)
 * while Next.js decodes the route param before it reaches the page. Build a
 * candidate set so lookups match regardless of stored vs. requested encoding.
 *
 * Note: `encodeURIComponent` emits UPPERCASE %XX, but the seeded slug is stored
 * LOWERCASE %xx — Postgres string matching is case-sensitive, so we add the
 * lowercased form too.
 */
function slugCandidates(slug: string): string[] {
  const set = new Set<string>([slug]);

  // V13 fix: canonical public URLs carry a trailing ".html" (e.g. /products/foo.html)
  // but DB slugs are stored without it, so every .html URL 404'd. Strip the suffix
  // (case-insensitive) across all slug variants so both forms resolve.
  const stripHtml = (s: string): string[] => {
    const out = [s];
    const m = s.match(/^(.*)\.html$/i);
    if (m) out.push(m[1]);
    return out;
  };

  let decoded: string | null = null;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* ignore */
  }

  const seeds = [...stripHtml(slug)];
  if (decoded && decoded !== slug) {
    seeds.push(decoded, ...stripHtml(decoded));
    try {
      const enc = encodeURIComponent(decoded);
      seeds.push(enc, ...stripHtml(enc));
    } catch {
      /* ignore */
    }
  }

  for (const s of seeds) {
    set.add(s);
    set.add(s.toLowerCase());
  }
  return [...set];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: { in: slugCandidates(slug) } },
      include: { categories: true },
    });
    return (product as unknown as Product) ?? null;
  } catch (err) {
    logDataError('getProductBySlug', err);
    return null;
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const ids = (product.relatedProducts || []).slice(0, limit);
  try {
    if (ids.length) {
      const found = await prisma.product.findMany({
        where: { id: { in: ids }, status: 'active' },
        include: { categories: true },
      });
      if (found.length) return found as unknown as Product[];
    }
    // Fallback: same-category products.
    const categorySlug = product.categories?.[0]?.slug;
    if (!categorySlug) return [];
    const fallback = await prisma.product.findMany({
      where: { status: 'active', categories: { some: { slug: categorySlug } }, NOT: { id: product.id } },
      take: limit,
      include: { categories: true },
    });
    return fallback as unknown as Product[];
  } catch (err) {
    logDataError('getRelatedProducts', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const cat = await prisma.category.findFirst({ where: { slug: { in: slugCandidates(slug) } } });
    return (cat as unknown as Category) ?? null;
  } catch (err) {
    logDataError('getCategoryBySlug', err);
    return null;
  }
}

export async function getBlogs(page = 1, pageSize = 9): Promise<Paginated<BlogPost>> {
  try {
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where: { status: 'published' } }),
    ]);
    return {
      data: items as unknown as BlogPost[],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    };
  } catch (err) {
    logDataError('getBlogs', err);
    return emptyPaginated<BlogPost>(page, pageSize);
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch (err) {
    logDataError('getAllBlogSlugs', err);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: { in: slugCandidates(slug) } },
    });
    return (post as unknown as BlogPost) ?? null;
  } catch (err) {
    logDataError('getBlogBySlug', err);
    return null;
  }
}

export async function getLatestBlogs(limit = 3): Promise<BlogPost[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return posts as unknown as BlogPost[];
  } catch (err) {
    logDataError('getLatestBlogs', err);
    return [];
  }
}

export async function getCompanyInfo(): Promise<{
  sections: Array<{ key: string; title: Record<string, string>; body: Record<string, string>; image?: string }>;
} | null> {
  try {
    const info = await prisma.companyInfo.findUnique({ where: { slug: 'main' } });
    if (!info) return null;
    const sections = (info.sections as unknown as Array<{
      key: string;
      title: Record<string, string>;
      body: Record<string, string>;
      image?: string;
    }>) ?? [];
    return { sections };
  } catch (err) {
    logDataError('getCompanyInfo', err);
    return null;
  }
}

/** Re-export the spec type for convenience. */
export type { ProductSpec };

// ============================================================
// V49.22 — Admin / SiteSetting / SiteFaq data access
// Every function degrades gracefully (try/catch) so a missing or unreachable
// database never crashes the page: SiteSetting → SITE_CONFIG, FAQ →
// FAQ_CATEGORIES, lists → [].
// ============================================================

// ---------- SiteSetting ----------

/** Build a `SiteSetting` from a raw `site_settings` row. */
function mapSiteSettingRow(row: Record<string, unknown>): SiteSetting {
  const socials = row.socials as { name: string; href: string }[] | null;
  const sameAs = row.sameAs as string[] | null;
  const keywords = row.keywords as { en?: string[]; zh?: string[]; ar?: string[] } | null;
  return {
    id: (row.id as string) ?? 'main',
    slug: (row.slug as string) ?? 'main',
    company: (row.company as I18nString) ?? null,
    email: (row.email as string) ?? SITE_CONFIG.email,
    phone: (row.phone as string) ?? SITE_CONFIG.phone,
    address: (row.address as I18nString) ?? null,
    addressLine: (row.addressLine as string) ?? null,
    socials: socials && socials.length ? socials : null,
    sameAs: sameAs && sameAs.length ? sameAs : null,
    ogImage: (row.ogImage as string) ?? SITE_CONFIG.ogImage,
    twitterHandle: (row.twitterHandle as string) ?? SITE_CONFIG.twitterHandle,
    keywords: keywords && (keywords.en?.length || keywords.zh?.length || keywords.ar?.length) ? keywords : null,
    defaultTitle: (row.defaultTitle as I18nString) ?? null,
    defaultDescription: (row.defaultDescription as I18nString) ?? null,
    forceHttps: (row.forceHttps as boolean) ?? false,
    sslCertPath: (row.sslCertPath as string) ?? null,
    sslKeyPath: (row.sslKeyPath as string) ?? null,
    sslEnabled: (row.sslEnabled as boolean) ?? false,
    updatedAt: row.updatedAt ? new Date(row.updatedAt as string | Date).toISOString() : new Date().toISOString(),
  };
}

/**
 * Read the single SiteSetting row (slug='main'). If the DB is unavailable or the
 * row does not exist yet, returns a `SITE_CONFIG`-derived object so the UI never
 * 500s during the deploy window before seed runs.
 */
export async function getSiteSetting(): Promise<SiteSetting> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { slug: 'main' } });
    if (row) return mapSiteSettingRow(row as unknown as Record<string, unknown>);
  } catch (err) {
    logDataError('getSiteSetting', err);
  }
  // Degrade to a SITE_CONFIG-constructed object.
  return {
    id: 'main',
    slug: 'main',
    company: { en: SITE_CONFIG.company, zh: '广州秋彦科技有限公司', ar: SITE_CONFIG.company },
    email: SITE_CONFIG.email,
    phone: SITE_CONFIG.phone,
    address: { en: SITE_CONFIG.addressLine, zh: SITE_CONFIG.addressLine, ar: SITE_CONFIG.addressLine },
    addressLine: SITE_CONFIG.addressLine,
    socials: null,
    sameAs: SITE_CONFIG.sameAs,
    ogImage: SITE_CONFIG.ogImage,
    twitterHandle: SITE_CONFIG.twitterHandle,
    keywords: { en: SITE_CONFIG.keywords, zh: [], ar: [] },
    defaultTitle: { en: SITE_CONFIG.defaultTitle, zh: SITE_CONFIG.defaultTitleZh, ar: SITE_CONFIG.defaultTitle },
    defaultDescription: {
      en: SITE_CONFIG.defaultDescription,
      zh: SITE_CONFIG.defaultDescriptionZh,
      ar: SITE_CONFIG.defaultDescription,
    },
    forceHttps: false,
    sslCertPath: null,
    sslKeyPath: null,
    sslEnabled: false,
    updatedAt: new Date().toISOString(),
  };
}

// ---------- SiteFaq (global FAQ) ----------

/** Map a raw SiteFaqItem row to the `SiteFaqItem` view type. */
function mapFaqItem(row: Record<string, unknown>): SiteFaqItem {
  return {
    id: row.id as string,
    question: row.question as I18nString,
    answer: row.answer as I18nString,
    faqOrder: (row.faqOrder as number) ?? 0,
  };
}

/**
 * Read all global FAQ categories with their nested items, ordered by faqOrder.
 * Degrades to `FAQ_CATEGORIES` (faq-data) when the DB is unavailable.
 */
export async function getSiteFaqCategories(): Promise<SiteFaqCategory[]> {
  try {
    const cats = await prisma.siteFaqCategory.findMany({
      orderBy: [{ faqOrder: 'asc' }, { key: 'asc' }],
      include: { items: { orderBy: [{ faqOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (cats && cats.length) {
      return (cats as unknown as Array<Record<string, unknown>>).map((c) => ({
        id: c.id as string,
        key: c.key as string,
        title: c.title as I18nString,
        faqOrder: (c.faqOrder as number) ?? 0,
        items: ((c.items as Array<Record<string, unknown>>) || []).map(mapFaqItem),
      }));
    }
  } catch (err) {
    logDataError('getSiteFaqCategories', err);
  }
  // Degrade to FAQ_CATEGORIES (faq-data).
  return FAQ_CATEGORIES.map((c) => ({
    id: c.id,
    key: c.id,
    title: c.title,
    faqOrder: 0,
    items: c.items.map((it, i) => ({
      id: `${c.id}-${i}`,
      question: it.question,
      answer: it.answer,
      faqOrder: i,
    })),
  }));
}

export async function getSiteFaqCategoryById(id: string): Promise<SiteFaqCategory | null> {
  try {
    const c = await prisma.siteFaqCategory.findUnique({
      where: { id },
      include: { items: { orderBy: [{ faqOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!c) return null;
    const row = c as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      key: row.key as string,
      title: row.title as I18nString,
      faqOrder: (row.faqOrder as number) ?? 0,
      items: ((row.items as Array<Record<string, unknown>>) || []).map(mapFaqItem),
    };
  } catch (err) {
    logDataError('getSiteFaqCategoryById', err);
    return null;
  }
}

export async function getSiteFaqItemById(id: string): Promise<SiteFaqItem | null> {
  try {
    const it = await prisma.siteFaqItem.findUnique({ where: { id } });
    if (!it) return null;
    return mapFaqItem(it as unknown as Record<string, unknown>);
  } catch (err) {
    logDataError('getSiteFaqItemById', err);
    return null;
  }
}

// ---------- Admin: Categories ----------

export interface AdminCategoryQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAdminCategories(query: AdminCategoryQuery = {}): Promise<Paginated<Category>> {
  const { search, page = 1, pageSize = 20 } = query;
  try {
    const all = (await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { slug: 'asc' }],
    })) as unknown as Category[];
    let filtered = all;
    if (search && search.trim()) {
      const needle = search.trim().toLowerCase();
      filtered = all.filter((c) => {
        const en = c.name && typeof c.name === 'object' ? (c.name as Record<string, string>).en : '';
        const slug = c.slug || '';
        return slug.toLowerCase().includes(needle) || (en && en.toLowerCase().includes(needle));
      });
    }
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    };
  } catch (err) {
    logDataError('getAdminCategories', err);
    return emptyPaginated<Category>(page, pageSize);
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const c = await prisma.category.findUnique({ where: { id } });
    return (c as unknown as Category) ?? null;
  } catch (err) {
    logDataError('getCategoryById', err);
    return null;
  }
}

// ---------- Admin: Products ----------

export interface AdminProductQuery {
  search?: string;
  status?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getAdminProducts(query: AdminProductQuery = {}): Promise<Paginated<Product>> {
  const { search, status, featured, page = 1, pageSize = 20 } = query;
  try {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (typeof featured === 'boolean') where.featured = featured;
    const orderBy = [{ order: 'asc' }, { sku: 'asc' }] as Record<string, unknown>[];

    if (search && search.trim()) {
      const all = (await prisma.product.findMany({
        where,
        orderBy,
        include: { categories: true },
      })) as unknown as Product[];
      const needle = search.trim().toLowerCase();
      const filtered = all.filter((p) => {
        const en = p.name && typeof p.name === 'object' ? (p.name as Record<string, string>).en : '';
        const sku = p.sku || '';
        const slug = p.slug || '';
        return (
          (en && en.toLowerCase().includes(needle)) ||
          sku.toLowerCase().includes(needle) ||
          slug.toLowerCase().includes(needle)
        );
      });
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        page,
        pageSize,
      };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { categories: true },
      }),
      prisma.product.count({ where }),
    ]);
    return {
      data: items as unknown as Product[],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    };
  } catch (err) {
    logDataError('getAdminProducts', err);
    return emptyPaginated<Product>(page, pageSize);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { categories: true },
    });
    return (p as unknown as Product) ?? null;
  } catch (err) {
    logDataError('getProductById', err);
    return null;
  }
}

// ---------- Admin: Blogs ----------

export async function getAdminBlogs(
  page = 1,
  status?: string,
  pageSize = 20
): Promise<Paginated<BlogPost>> {
  try {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.blogPost.count({ where }),
    ]);
    return {
      data: items as unknown as BlogPost[],
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    };
  } catch (err) {
    logDataError('getAdminBlogs', err);
    return emptyPaginated<BlogPost>(page, pageSize);
  }
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  try {
    const b = await prisma.blogPost.findUnique({ where: { id } });
    return (b as unknown as BlogPost) ?? null;
  } catch (err) {
    logDataError('getBlogById', err);
    return null;
  }
}
