import type { Metadata } from 'next';
import FaqAccordion from '@/components/faq/FaqAccordion';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/faq',
    title: 'FAQ',
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['Qtech FAQ', 'vending machine support'], locale),
  });
}

export default function FaqPage() {
  return <FaqAccordion />;
}
