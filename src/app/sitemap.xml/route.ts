import { prisma } from '@/lib/prisma';

const LOCALES = ['en'] as const;
// V49.22: Production only — test domain removed (was causing duplicate indexing)
const HOSTS = ['https://www.qtechvending.com'];
const STATIC_PATHS = ['', '/products', '/blog', '/about', '/contact'];

// Dynamic route — never pre-rendered; resolved per request so the sitemap
// always reflects the latest published products / posts / categories.
export const dynamic = 'force-dynamic';

/**
 * Build a human-readable, indented XML sitemap and return it as a proper
 * `application/xml` Response. Unlike the built-in `app/sitemap.ts` convention
 * (which serialises an array into a single un-indented line), this route
 * handler emits one `<url>` block per line with clear 2-space indentation so
 * the file is legible when opened directly in a browser.
 *
 * Rendering notes (why application/xml + nosniff):
 *  - `application/xml` is the standard MIME type for XML and makes browsers
 *    render the XML tree (rather than showing raw source or falling back to
 *    HTML / plain text) reliably.
 *  - `X-Content-Type-Options: nosniff` stops proxies/browsers from sniffing a
 *    different MIME type and falling back to plain-text display.
 *
 * IMPORTANT — no `xhtml:link` / `xmlns:xhtml` / `xmlns:xsi`:
 *  Chrome's XML renderer treats the `xmlns:xhtml` namespace and any
 *  `<xhtml:link rel="alternate" hreflang="...">` child elements as a signal to
 *  switch into an HTML-like document mode. In that mode it only paints the
 *  text-node content and hides the XML element tree, so the sitemap appears as
 *  plain text instead of the familiar collapsible XML tree. To keep the sitemap
 *  rendering as a proper XML tree across browsers (Chrome included), we emit a
 *  plain sitemap/0.9 document with only `xmlns` and the standard
 *  loc / lastmod / changefreq / priority children. Hreflang alternates (when
 *  needed) are still validly expressed via the sitemap protocol, but we omit
 *  the XHTML namespace form that breaks Chrome's rendering.
 *
 * Caching notes (aligned with the test.wstoolcabinet.com reference):
 *  - `Content-Type: application/xml` (no charset) so the browser parses the
 *    document as XML and displays the tree.
 *  - `Cache-Control: public, max-age=3600, s-maxage=3600` lets the CDN/edge
 *    cache the response for an hour while still serving it publicly.
 *  - `CDN-Cache-Control` / `Surrogate-Control` / `Pragma` are intentionally
 *    omitted to match the reference host exactly and avoid header drift.
 */
export async function GET(): Promise<Response> {
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

  const lastmod = new Date().toISOString();

  const urlBlocks: string[] = [];

  for (const host of HOSTS) {
    for (const locale of LOCALES) {
      const allPaths = [...STATIC_PATHS, ...dynamicPaths];
      for (const path of allPaths) {
        const url = `${host}/${locale}${path}`;
        const priority = path === '' ? 1 : 0.7;
        urlBlocks.push(
          [
            '  <url>',
            `    <loc>${url}</loc>`,
            `    <lastmod>${lastmod}</lastmod>`,
            '    <changefreq>weekly</changefreq>',
            `    <priority>${priority}</priority>`,
            '  </url>',
          ].join('\n'),
        );
      }
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlBlocks,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
