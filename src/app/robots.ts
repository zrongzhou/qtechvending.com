import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtechvending.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/xiaozhouBackend/', '/api/'],
    },
    sitemap: [
      'https://www.qtechvending.com/sitemap.xml',
      'https://test.qtechvending.com/sitemap.xml',
    ],
    host: BASE_URL,
  };
}
