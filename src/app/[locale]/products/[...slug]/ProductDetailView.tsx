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
import { ArrowLeft, Settings2 } from 'lucide-react';
import type { Product } from '@/types';

function renderParagraphs(text: string) {
  // Split into readable paragraphs: first by blank lines, then by sentence
  // boundaries (". ") so long description blocks become clean <p> elements.
  return text
    .split(/\n{2,}/)
    .flatMap((block) =>
      block
        .replace(/\.\s+/g, '.\n')
        .split('\n')
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    )
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
  // C4: prefer a short, clean display title in the H1; fall back to the full name.
  const heading = product.displayTitle ? localized(product.displayTitle, locale) || name : name;
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
      {/* Back to products */}
      <Link
        href={`/${locale}/products`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
        {t('product.backToProducts')}
      </Link>

      {/* Breadcrumb */}
      <nav className="mb-6 mt-4 text-sm text-ink-400">
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
            <ImageWithRetry src={activeImage} alt={name} loading="eager" fetchPriority="high" className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  aria-label={name}
                  aria-pressed={activeImage === img}
                  className={`group relative h-20 w-20 overflow-hidden rounded-xl border-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 active:scale-95 ${
                    activeImage === img ? 'border-brand-500 shadow-md' : 'border-transparent hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Wrapper span carries the hover-zoom so it never collides with
                      ImageWithRetry's internal opacity fade-in transition. */}
                  <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                    <ImageWithRetry src={img} alt="" className="h-full w-full object-cover" />
                  </span>
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
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{heading}</h1>
          {short && <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{short}</p>}

          <Link
            href={`/${locale}/contact${categorySlug ? `?product=${categorySlug}` : ''}`}
            className="btn-primary mt-6 px-7 py-3 text-sm"
          >
            {t('product.inquire')}
          </Link>

          <div className="mt-10">
            {specs.length > 0 ? (
              <RevealOnScroll>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Gradient header */}
                  <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-4">
                    <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
                      <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-white/20 text-white p-2" />
                      {t('product.specs')}
                    </h2>
                  </div>

                  {/* Clean spec rows — alternating bands, monospace params, hover highlight */}
                  <dl className="divide-y divide-slate-100">
                    {specs.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 px-6 py-4 transition-colors even:bg-slate-50 hover:bg-brand-50/50 sm:flex-row sm:gap-6"
                      >
                        <dt className="w-40 shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-brand-600">
                          {s.param}
                        </dt>
                        <dd className="text-sm font-medium leading-relaxed text-ink-800">
                          {s.value || '—'}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </RevealOnScroll>
            ) : (
              <RevealOnScroll>
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-5">
                  <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-brand-100 text-brand-700 p-2" />
                  <p className="text-sm font-medium text-ink-600">{t('product.contactForSpecs')}</p>
                </div>
              </RevealOnScroll>
            )}
          </div>

          <RevealOnScroll className="mt-6">
            <ProductFaqSection features={product.features} />
          </RevealOnScroll>
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
