import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ProductsClient from '@/app/[locale]/products/ProductsClient';
import { getCategoryBySlug, getCategories, getProducts } from '@/lib/data';
import { localized } from '@/lib/localize';
import { generatePageMetadata } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  const name = category
    ? localized(category.name, params.locale as 'en' | 'zh' | 'ar')
    : 'Category';
  return generatePageMetadata({
    path: `/category/${params.slug}`,
    title: name,
    description: category ? localized(category.description, params.locale as 'en' | 'zh' | 'ar') : undefined,
    keywords: buildStaticPageKeywords([name, 'Qtech'], params.locale),
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [categories, initial] = await Promise.all([
    getCategories(),
    getProducts({ categories: [slug], page: 1, sort: 'featured' }),
  ]);

  const name = localized(category.name, locale as 'en' | 'zh' | 'ar');
  const description = localized(category.description, locale as 'en' | 'zh' | 'ar');

  return (
    <div>
      {/* Category banner */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container-qtech py-12">
          <nav className="mb-4 text-sm text-white/80">
            <Link href={`/${locale}`} className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/products`} className="hover:underline">Products</Link>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {locale === 'zh' ? '浏览分类' : locale === 'ar' ? 'تصفح الفئة' : 'Browse Category'}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {name ? `${name}` : 'Category'}
          </h1>
          {description && <p className="mt-3 max-w-2xl text-white/90">{description}</p>}
        </div>
      </section>

      <ProductsClient categories={categories} initial={initial} />
    </div>
  );
}
