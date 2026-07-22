import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const LOCALES = ['en', 'zh', 'ar'] as const;
// V49.22: Production only — test domain removed (was causing duplicate indexing)
const HOSTS = ['https://www.qtechvending.com'];
const STATIC_PATHS = ['', '/products', '/blog', '/about', '/contact'];

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productSlugs: string[] = [];
  let blogSlugs: string[] = [];
  let categorySlugs: string[] = [];

  try {
    const [p, b, c] = await Promise.all([
      prisma.product.findMany({ where: { status: 'active' }, select: { slug: true } }),
      prisma.blogPost.findMany({ where: { status: 'published' }, select: { slug: true } }),
      prisma.category.findMany({ where: { status: 'active' }, select: { slug: true } }),
    ]);
    productSlugs = p.map((x) => x.slug);
    blogSlugs = b.map((x) => x.slug);
    categorySlugs = c.map((x) => x.slug);
  } catch {
    // DB not reachable (e.g. during build) — emit static URLs only.
  }

  const dynamicPaths: string[] = [
    ...categorySlugs.map((s) => `/category/${s}`),
    ...productSlugs.map((s) => `/products/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const host of HOSTS) {
    for (const locale of LOCALES) {
      const allPaths = [...STATIC_PATHS, ...dynamicPaths];
      for (const path of allPaths) {
        const url = `${host}/${locale}${path}`;
        entries.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: path === '' ? 1 : 0.7,
          alternates: {
            languages: {
              en: `${host}/en${path}`,
              'zh-CN': `${host}/zh${path}`,
              ar: `${host}/ar${path}`,
              'x-default': `${host}/en${path}`,
            },
          },
        });
      }
    }
  }

  return entries;
}
