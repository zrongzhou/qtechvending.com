import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { getCategories, getSiteSetting } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
  searchParams: { product?: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/contact',
    title: 'Contact',
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['contact Qtech', 'request a quote'], locale),
  });
}

export default async function ContactPage({ params, searchParams }: PageProps) {
  const [categories, site] = await Promise.all([getCategories(), getSiteSetting()]);
  return <ContactClient categories={categories} site={site} initialProductInterest={searchParams.product || ''} />;
}
