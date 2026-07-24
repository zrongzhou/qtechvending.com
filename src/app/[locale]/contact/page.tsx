import type { Metadata } from 'next';
import ContactClient from './ContactClient';
import { getCategories, getSiteSetting } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    path: '/contact',
    locale,
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['contact Qtech', 'request a quote'], locale),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const [categories, site] = await Promise.all([getCategories(), getSiteSetting()]);
  return <ContactClient categories={categories} site={site} initialProductInterest="" />;
}
