import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';
import { getBlogs } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/blog',
    locale,
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['Qtech blog', 'vending machine news'], locale),
  });
}

export default async function BlogPage() {
  const initial = await getBlogs(1, 9);
  return <BlogListClient initial={initial} />;
}
