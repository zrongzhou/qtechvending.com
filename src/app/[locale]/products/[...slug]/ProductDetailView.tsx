'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ProductCard from '@/components/products/ProductCard';
import ProductFaqSection from './ProductFaqSection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import { Settings2 } from 'lucide-react';
import type { Product } from '@/types';

function renderParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className="mb-4 leading-relaxed text-ink-600">
        {p}
      </p>
    ));
}

export default function ProductDetailView({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { t, locale } = useLocale();
  const name = localized(product.name, locale);
  const short = localized(product.shortDescription, locale);
  const description = localized(product.description, locale);
  const specs = product.specs || [];
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';
  const categorySlug = category?.slug || '';

  const images = product.images && product.images.length ? product.images : ['/images/og-default.svg'];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="container-qtech py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-400">
        <Link href={`/${locale}`} className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}/products`} className="hover:text-brand-700">{t('nav.products')}</Link>
        {categorySlug && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/${locale}/category/${categorySlug}`} className="hover:text-brand-700">
              {categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery — sticky on desktop so the main image stays in view while scrolling specs/description */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ring-1 ring-brand-100">
            <ImageWithRetry src={activeImage} alt={name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                    activeImage === img ? 'border-brand-500 shadow-md' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <ImageWithRetry src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {categoryName && (
            <span className="inline-flex w-fit items-center rounded-md bg-gradient-to-r from-brand-50 to-brand-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {categoryName}
            </span>
          )}
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{name}</h1>
          {short && <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{short}</p>}

          <Link
            href={`/${locale}/contact${categorySlug ? `?product=${categorySlug}` : ''}`}
            className="btn-primary mt-6 px-7 py-3 text-sm"
          >
            {t('product.inquire')}
          </Link>

          {specs.length > 0 && (
            <RevealOnScroll className="mt-8">
              <div className="pro-card relative overflow-hidden">
                <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
                <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 text-lg font-bold text-ink-900">
                  <IconTile icon={Settings2} className="h-7 w-7" tileClassName="bg-brand-50 text-brand-700" />
                  {t('product.specs')}
                </h2>
                <dl>
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-1 gap-1 px-5 py-3.5 text-sm sm:grid-cols-3 sm:gap-4 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-brand-50/50'
                      }`}
                    >
                      <dt className="font-semibold text-brand-700 sm:col-span-1">{s.param}</dt>
                      <dd className="text-ink-700 sm:col-span-2">{s.value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </RevealOnScroll>
          )}

          <div className="mt-6">
            <ProductFaqSection features={product.features} />
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <RevealOnScroll as="section" className="mt-12 md:mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">{t('product.description')}</h2>
          <div className="prose-qtech mt-4">{renderParagraphs(description)}</div>
        </RevealOnScroll>
      )}

      {/* Related */}
      {related.length > 0 && (
        <RevealOnScroll as="section" className="mt-14 md:mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">{t('product.related')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}
