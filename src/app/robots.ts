import type { MetadataRoute } from 'next';

// V49.22: Production domain — only www (test domain removed from sitemap refs)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtechvending.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
