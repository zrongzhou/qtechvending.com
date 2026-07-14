import { prisma } from './prisma';
import type { Product, BlogPost, Category, Paginated, ProductSpec } from '@/types';

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
  let decoded: string | null = null;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* ignore */
  }
  if (decoded && decoded !== slug) {
    set.add(decoded);
    try {
      const enc = encodeURIComponent(decoded);
      set.add(enc);
      set.add(enc.toLowerCase());
    } catch {
      /* ignore */
    }
  }
  set.add(slug.toLowerCase());
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
