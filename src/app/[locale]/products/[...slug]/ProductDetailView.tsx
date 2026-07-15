'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ProductCard from '@/components/products/ProductCard';
import ProductFaqSection from './ProductFaqSection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
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
            <span className="text-sm font-medium uppercase tracking-wide text-coral-600">
              {categoryName}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-bold text-ink-900">{name}</h1>
          {short && <p className="mt-3 text-ink-500">{short}</p>}

          <Link
            href={`/${locale}/contact${categorySlug ? `?product=${categorySlug}` : ''}`}
            className="btn-sunset mt-6 px-7 py-3 text-sm"
          >
            {t('product.inquire')}
          </Link>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ink-900">{t('product.specs')}</h2>
              <dl className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                {specs.map((s, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <dt className="font-medium text-ink-700">{s.param}</dt>
                    <dd className="text-ink-600">{s.value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6">
            <ProductFaqSection features={product.features} />
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-ink-900">{t('product.description')}</h2>
          <div className="prose-qtech mt-4">{renderParagraphs(description)}</div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink-900">{t('product.related')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
