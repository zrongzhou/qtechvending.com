import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import { getFeaturedProducts, getLatestBlogs, getCategories, getCategoryProductCounts } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

// P0 / CWV: 首屏以下的重型 client 组件改用 next/dynamic 懒加载（代码分割，保留 SSR 以保 SEO/首屏）。
// qtechvending 移动端 TBT 高达 23.6s（首屏 JS 过多），根因是首页把 9 个 client 组件一次性打进主 bundle。
// 这里只保留首屏 HeroSection 为直接 import（含 LCP 图，必须即时渲染），其余非首屏组件用「不带 ssr:false」
// 的 dynamic（SSR + 代码分割），把它们的 JS 拆到独立 chunk，首屏只加载 hero，从而降低 TBT。
// 注意：Next 15 禁止在 Server Component 内使用 dynamic(..., { ssr: false })，故此处全部不带 ssr:false。
const CategoriesGrid = dynamic(() => import('@/components/home/CategoriesGrid'));
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'));
const AdvantagesSection = dynamic(() => import('@/components/home/AdvantagesSection'));
const PartnersSection = dynamic(() => import('@/components/home/PartnersSection'));
const StatsBand = dynamic(() => import('@/components/home/StatsBand'));
const CasesSection = dynamic(() => import('@/components/home/CasesSection'));
const BlogPreview = dynamic(() => import('@/components/home/BlogPreview'));
const CtaSection = dynamic(() => import('@/components/home/CtaSection'));

export const revalidate = 300;

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/',
    locale,
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
      <PartnersSection />
      <StatsBand />
      <CasesSection />
      <BlogPreview posts={blogs} />
      <CtaSection />
    </>
  );
}
