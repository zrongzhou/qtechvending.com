import type { Metadata } from 'next';
import SolutionsGrid from '@/components/solutions/SolutionsGrid';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/solutions',
    title: 'Solutions',
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['vending solutions', 'Qtech', 'smart lockers'], locale),
  });
}

export default function SolutionsPage() {
  return <SolutionsGrid />;
}
