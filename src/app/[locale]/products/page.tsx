import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';
import { getCategories, getProducts } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    path: '/products',
    locale,
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['vending machine', 'Qtech products'], locale),
  });
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params;
  const [categories, initial] = await Promise.all([
    getCategories(),
    getProducts({ page: 1, sort: 'featured' }),
  ]);

  return <ProductsClient categories={categories} initial={initial} />;
}
