import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailView from './ProductDetailView';
import JsonLd from '@/components/JsonLd';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { localized } from '@/lib/localize';
import { generatePageMetadata, jsonLdProduct, jsonLdBreadcrumb } from '@/lib/seo';
import { seoKeywordList } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; slug: string[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug[0];
  const product = await getProductBySlug(slug);
  if (!product) return generatePageMetadata({ path: `/products/${slug}`, locale: params.locale });
  const name = localized(product.name, params.locale as 'en' | 'zh' | 'ar');
  const seoTitle = product.seoTitle ? localized(product.seoTitle, params.locale as 'en' | 'zh' | 'ar') : '';
  const desc =
    (product.seoDescription ? localized(product.seoDescription, params.locale as 'en' | 'zh' | 'ar') : '')
    || localized(product.description, params.locale as 'en' | 'zh' | 'ar')
    || localized(product.shortDescription, params.locale as 'en' | 'zh' | 'ar');
  const kw = seoKeywordList(product.seoKeywords, params.locale as 'en' | 'zh' | 'ar');
  return generatePageMetadata({
    path: `/products/${slug}`,
    locale: params.locale,
    title: seoTitle || name,
    description: desc,
    image: product.images?.[0],
    type: 'product',
    keywords: kw && kw.length ? kw : ['vending machine', 'Qtech', name].filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const slug = params.slug[0];
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const categorySlug = product.categories?.[0]?.slug || '';
  const categoryName = product.categories?.[0]
    ? localized(product.categories[0].name, params.locale as 'en' | 'zh' | 'ar')
    : '';

  return (
    <>
      <JsonLd
        data={jsonLdProduct({
          name: localized(product.name, params.locale as 'en' | 'zh' | 'ar'),
          description: localized(product.shortDescription, params.locale as 'en' | 'zh' | 'ar') || '',
          image: product.images?.[0] || '/images/og-default.svg',
          slug,
          category: categoryName,
        })}
      />
      <JsonLd
        data={jsonLdBreadcrumb([
          { name: 'Home', url: `/${params.locale}` },
          { name: 'Products', url: `/${params.locale}/products` },
          ...(categorySlug
            ? [{ name: categoryName, url: `/${params.locale}/category/${categorySlug}` }]
            : []),
          { name: localized(product.name, params.locale as 'en' | 'zh' | 'ar'), url: `/${params.locale}/products/${slug}` },
        ])}
      />
      <ProductDetailView product={product} related={related} />
    </>
  );
}
