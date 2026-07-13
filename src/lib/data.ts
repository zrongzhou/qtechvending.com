import { prisma } from './prisma';
import type { Product, BlogPost, Category, Paginated, ProductSpec } from '@/types';

/**
 * Server-only data access layer. All functions use the singleton Prisma client.
 * Pages that call these are marked `dynamic = 'force-dynamic'` so they are
 * rendered on demand (no build-time DB connection required).
 */

export async function getCategories(): Promise<Category[]> {
  const cats = await prisma.category.findMany({
    where: { status: 'active', type: 'product' },
    orderBy: [{ order: 'asc' }, { slug: 'asc' }],
  });
  return cats as unknown as Category[];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    take: limit,
    include: { categories: true },
  });
  return products as unknown as Product[];
}

export interface ProductQuery {
  categories?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: 'featured' | 'newest' | 'name';
}

export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  const { categories, search, page = 1, pageSize = 9, sort = 'featured' } = query;
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
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: 'active' },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { categories: true },
  });
  return (product as unknown as Product) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const ids = (product.relatedProducts || []).slice(0, limit);
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
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cat = await prisma.category.findUnique({ where: { slug } });
  return (cat as unknown as Category) ?? null;
}

export async function getBlogs(page = 1, pageSize = 9): Promise<Paginated<BlogPost>> {
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
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  return (post as unknown as BlogPost) ?? null;
}

export async function getLatestBlogs(limit = 3): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
  return posts as unknown as BlogPost[];
}

export async function getCompanyInfo(): Promise<{
  sections: Array<{ key: string; title: Record<string, string>; body: Record<string, string>; image?: string }>;
} | null> {
  const info = await prisma.companyInfo.findUnique({ where: { slug: 'main' } });
  if (!info) return null;
  const sections = (info.sections as unknown as Array<{
    key: string;
    title: Record<string, string>;
    body: Record<string, string>;
    image?: string;
  }>) ?? [];
  return { sections };
}

/** Re-export the spec type for convenience. */
export type { ProductSpec };
