import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import StatsBand from '@/components/home/StatsBand';
import PartnersSection from '@/components/home/PartnersSection';
import BlogPreview from '@/components/home/BlogPreview';
import CtaSection from '@/components/home/CtaSection';
import { getFeaturedProducts, getLatestBlogs, getCategories, getCategoryProductCounts } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/',
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['vending machine', 'Qtech', 'fresh flower vending'], locale),
  });
}

export default async function HomePage({ params: { locale } }: PageProps) {
  const [featured, blogs, categories, counts] = await Promise.all([
    getFeaturedProducts(6),
    getLatestBlogs(3),
    getCategories(),
    getCategoryProductCounts(),
  ]);

  return (
    <>
      <HeroSection products={featured} />
      <CategoriesGrid categories={categories} counts={counts} />
      <FeaturedProducts products={featured} />
      <AdvantagesSection />
      <StatsBand />
      <PartnersSection />
      <BlogPreview posts={blogs} />
      <CtaSection />
    </>
  );
}
