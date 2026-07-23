import type { Metadata } from 'next';
import FaqAccordion from '@/components/faq/FaqAccordion';
import { getSiteFaqCategories } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const revalidate = 300;

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/faq',
    locale,
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['Qtech FAQ', 'vending machine support'], locale),
  });
}

export default async function FaqPage() {
  const categories = await getSiteFaqCategories();
  return <FaqAccordion categories={categories} />;
}
