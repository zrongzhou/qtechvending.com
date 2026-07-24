import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailView from './ProductDetailView';
import JsonLd from '@/components/JsonLd';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { localized } from '@/lib/localize';
import { generatePageMetadata, jsonLdProduct, jsonLdBreadcrumb } from '@/lib/seo';
import { seoKeywordList } from '@/lib/seo-keywords';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugStr = slug[0];
  const product = await getProductBySlug(slugStr);
  if (!product) return generatePageMetadata({ path: `/products/${slugStr}`, locale });
  const name = localized(product.name, locale as 'en' | 'zh' | 'ar');
  const seoTitle = product.seoTitle ? localized(product.seoTitle, locale as 'en' | 'zh' | 'ar') : '';
  const desc =
    (product.seoDescription ? localized(product.seoDescription, locale as 'en' | 'zh' | 'ar') : '')
    || localized(product.description, locale as 'en' | 'zh' | 'ar')
    || localized(product.shortDescription, locale as 'en' | 'zh' | 'ar');
  const kw = seoKeywordList(product.seoKeywords, locale as 'en' | 'zh' | 'ar');
  return generatePageMetadata({
    path: `/products/${slugStr}`,
    locale,
    title: seoTitle || name,
    description: desc,
    image: product.images?.[0],
    type: 'product',
    keywords: kw && kw.length ? kw : ['vending machine', 'Qtech', name].filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug: slugArr } = await params;
  const slug = slugArr[0];
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const categorySlug = product.categories?.[0]?.slug || '';
  const categoryName = product.categories?.[0]
    ? localized(product.categories[0].name, locale as 'en' | 'zh' | 'ar')
    : '';

  return (
    <>
      <JsonLd
        data={jsonLdProduct({
          name: localized(product.name, locale as 'en' | 'zh' | 'ar'),
          description: localized(product.shortDescription, locale as 'en' | 'zh' | 'ar') || '',
          image: product.images?.[0] || '/images/og-default.svg',
          slug,
          category: categoryName,
        })}
      />
      <JsonLd
        data={jsonLdBreadcrumb([
          { name: 'Home', url: `/${locale}` },
          { name: 'Products', url: `/${locale}/products` },
          ...(categorySlug
            ? [{ name: categoryName, url: `/${locale}/category/${categorySlug}` }]
            : []),
          { name: localized(product.name, locale as 'en' | 'zh' | 'ar'), url: `/${locale}/products/${slug}` },
        ])}
      />
      <ProductDetailView product={product} related={related} />
    </>
  );
}
