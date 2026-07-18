'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ProductCard from '@/components/products/ProductCard';
import ProductFaqSection from './ProductFaqSection';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import OceanBubbles from '@/components/ui/OceanBubbles';
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
      <p key={i} className="mb-4 leading-relaxed text-cyan-50/80">
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-600/50 via-teal-500/35 to-sky-400/25">
      {/* Deep ocean base layer behind the brighter overlay for depth (V38 lighter). */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-cyan-700 via-teal-600 to-sky-500" aria-hidden="true" />
      {/* Sunlight sheen from the surface */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-sky-400/25 via-cyan-400/10 to-transparent" aria-hidden="true" />
      {/* God rays */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="god-ray god-ray--1" />
        <div className="god-ray god-ray--2" />
        <div className="god-ray god-ray--3" />
      </div>
      {/* Rising bubbles — rendered behind the content layer via -z-10. */}
      <OceanBubbles className="-z-10" />
      {/* Bottom ocean waves */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 overflow-hidden" aria-hidden="true">
        <div className="ocean-wave ocean-wave--1" />
        <div className="ocean-wave ocean-wave--2" />
        <div className="ocean-wave ocean-wave--3" />
      </div>

      <div className="container-qtech relative z-10 py-10 lg:py-14">
        {/* Back to products */}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-100/70 transition-colors hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t('product.backToProducts')}
        </Link>

        {/* Breadcrumb */}
        <nav className="mb-6 mt-4 text-sm text-cyan-50/60">
          <Link href={`/${locale}`} className="transition-colors hover:text-cyan-200">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/products`} className="transition-colors hover:text-cyan-200">{t('nav.products')}</Link>
          {categorySlug && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/${locale}/category/${categorySlug}`} className="transition-colors hover:text-cyan-200">
                {categoryName}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery — sticky on desktop so the main image stays in view while scrolling specs/description */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <OceanGlassCard ripple depth="lg" hoverLift={false} rippleRings={3} ripplePointer rippleColor="rgba(56,189,248,0.28)" className="relative overflow-hidden p-2 sm:p-3">
              {/* Ocean top accent bar — card memory point */}
              <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent)',
                  maskImage: 'linear-gradient(to bottom, #000 80%, transparent)',
                }}
              >
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
                    className={`group relative h-20 w-20 overflow-hidden rounded-xl border-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-900 active:scale-95 ${
                      activeImage === img ? 'border-ocean-400 shadow-[0_0_18px_rgba(56,189,248,0.5)]' : 'border-white/20 hover:border-white/40 hover:shadow-sm'
                    }`}
                  >
                    <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                      <ImageWithRetry src={img} alt="" className="h-full w-full object-cover" />
                    </span>
                  </button>
                ))}
              </div>
            )}
            </OceanGlassCard>
          </div>

          {/* Info */}
          <div>
            {categoryName && (
              <span className="inline-flex w-fit items-center rounded-md border border-white/20 bg-gradient-to-r from-cyan-50/15 to-teal-50/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-100/90">
                {categoryName}
              </span>
            )}
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">{heading}</h1>
            {short && <p className="mt-3 max-w-xl text-base leading-relaxed text-cyan-50/80">{short}</p>}

            <Link
              href={`/${locale}/contact${categorySlug ? `?product=${categorySlug}` : ''}`}
              className="btn-primary mt-6 px-7 py-3 text-sm"
            >
              {t('product.inquire')}
            </Link>

            <div className="mt-10">
              {specs.length > 0 ? (
                <RevealOnScroll>
                  <OceanGlassCard ripple depth="md" rippleRings={3} ripplePointer rippleColor="rgba(56,189,248,0.28)" className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.12] backdrop-blur-xl transition-shadow duration-500">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-ocean-500/80 to-brand-600/80 px-6 py-4">
                      <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
                        <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-white/20 text-white p-2" />
                        {t('product.specs')}
                      </h2>
                    </div>

                    {/* Clean spec rows — alternating bands, monospace params, hover highlight */}
                    <dl className="divide-y divide-white/10">
                      {specs.map((s, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-1 px-6 py-4 transition-colors even:bg-white/8 hover:bg-white/15 sm:flex-row sm:gap-6"
                        >
                          <dt className="w-40 shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-cyan-200">
                            {s.param}
                          </dt>
                          <dd className="text-sm font-medium leading-relaxed text-white/90">
                            {s.value || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </OceanGlassCard>
                </RevealOnScroll>
              ) : (
                <RevealOnScroll>
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-cyan-200/40 bg-white/5 px-6 py-5">
                    <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-cyan-500/30 text-cyan-100 p-2" />
                    <p className="text-sm font-medium text-cyan-50/80">{t('product.contactForSpecs')}</p>
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
            <OceanGlassCard depth="sm" className="border border-white/15 bg-white/[0.06] p-7">
              <h2 className="text-2xl font-bold tracking-tight text-white">{t('product.description')}</h2>
              <div className="mt-4 max-w-none">{renderParagraphs(description)}</div>
            </OceanGlassCard>
          </RevealOnScroll>
        )}

        {/* Related */}
        {related.length > 0 && (
          <RevealOnScroll as="section" className="mt-14 md:mt-20">
            <h2 className="text-2xl font-bold tracking-tight text-white">{t('product.related')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} ocean />
              ))}
            </div>
          </RevealOnScroll>
        )}
      </div>
    </div>
  );
}
