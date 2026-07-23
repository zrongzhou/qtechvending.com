'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ProductCard from '@/components/products/ProductCard';
import ProductFaqSection from './ProductFaqSection';
import ProductFaqAccordion from './ProductFaqAccordion';
import type { FaqItem } from '@/types';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import OceanBubbles from '@/components/ui/OceanBubbles';
import RippleOnHover from '@/components/ui/RippleOnHover';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import Fireworks from '@/components/ui/Fireworks';
import { ArrowLeft, Settings2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, I18nStringList } from '@/types';

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

type TabId = 'features' | 'specs' | 'description' | 'faq';

/**
 * V41: combines Specifications / Key Features / Description into a single
 * dark-glass Tab switcher. The active tab is highlighted with a brand-coloured
 * (cyan→teal) underline; inactive tabs are muted. Switching fades the panel in.
 * The tab bar scrolls horizontally on small screens (no-scrollbar).
 */
function ProductDetailTabs({
  specs,
  features,
  description,
  faq,
  t,
}: {
  specs: Product['specs'];
  features: I18nStringList | null;
  description: string;
  faq: FaqItem[] | null;
  t: (key: string) => string;
}) {
  const { locale } = useLocale();
  const [active, setActive] = useState<TabId>('features');
  const specList = specs ?? [];
  // V45: a calm, slightly-warmer frosted panel. Lower opacity (slate-50/60)
  // with a lighter blur so the glass reads soft, not cold.
  const tabPanel =
    'relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 backdrop-blur-sm shadow-soft';

  // Mobile tab scroll: ref + programmatic scrollBy for arrow buttons
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (dir: -1 | 1) => {
    tabScrollRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'features', label: t('product.features') },
    { id: 'specs', label: t('product.specs') },
  ];
  if (description) tabs.push({ id: 'description', label: t('product.description') });
  // V49.15: always show the FAQ tab when the product has Q&A entries.
  if (faq && faq.length > 0) tabs.push({ id: 'faq', label: t('product.faq') });

  return (
    <div className="mt-10">
      {/* Tab bar — frosted glass rail with mobile arrow scroll buttons */}
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollTabs(-1)}
          aria-label="Scroll tabs left"
          className="absolute -start-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyan-200 bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-cyan-50 active:scale-95 lg:hidden"
        >
          <ChevronLeft className="h-4 w-4 text-cyan-600" />
        </button>
        <div
          ref={tabScrollRef}
          className="glass-surface flex snap-x snap-mandatory gap-1 overflow-x-auto rounded-2xl p-1.5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-pressed={isActive}
              className={`relative snap-start whitespace-nowrap border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-cyan-500 bg-cyan-50/40 text-cyan-700'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        </div>
        {/* Right arrow + edge fade gradient — mobile only, INSIDE relative container */}
        <button
          type="button"
          onClick={() => scrollTabs(1)}
          aria-label="Scroll tabs right"
          className="absolute -end-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyan-200 bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-colors hover:bg-cyan-50 active:scale-95 lg:hidden"
        >
          <ChevronRight className="h-4 w-4 text-cyan-600" />
        </button>
        <div className="pointer-events-none absolute inset-y-0 end-6 w-10 rounded-e-2xl bg-gradient-to-l from-slate-50/80 to-transparent lg:hidden" />
      </div>

      {/* Panel — dark glass, soft fade on every switch (V42: never a white
          background, even on the light product-detail page). */}
      <div key={active} className="mt-4 animate-fade-in">
        {active === 'features' && <ProductFaqSection features={features} />}

        {active === 'specs' &&
          (specList.length > 0 ? (
            <RippleOnHover
              pointerDriven
              rippleColor="rgba(56,189,248,0.28)"
              rings={3}
              className={tabPanel}
            >
              <div className="bg-gradient-to-r from-ocean-500/80 to-brand-600/80 px-6 py-4">
                <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
                  <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-white/20 text-white p-2" />
                  {t('product.specs')}
                </h2>
              </div>
              {/* Non-table spec layout — compact tag / statement grid.
                  Looks good even when values are empty or keys are long sentences. */}
              <div className="flex flex-col gap-3 p-6">
                {specList.map((s, i) => {
                  const paramText = typeof s.param === 'string' ? s.param : localized(s.param, locale);
                  const valueText = typeof s.value === 'string' ? s.value : localized(s.value, locale);
                  return (
                  <div
                    key={i}
                    className="group flex flex-col gap-1 rounded-xl border border-slate-100 bg-white/50 px-4 py-3 transition-colors hover:bg-cyan-50/40 hover:border-cyan-200"
                  >
                    {valueText ? (
                      <>
                        <span className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
                          {paramText}
                        </span>
                        <span className="text-sm leading-relaxed text-ink-700">{valueText}</span>
                      </>
                    ) : (
                      /* Bare statement (no value) — render as a standalone line */
                      <span className="text-sm leading-relaxed text-ink-700">
                        {paramText}
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
            </RippleOnHover>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-cyan-300/40 bg-white/60 px-6 py-5">
              <IconTile icon={Settings2} className="h-6 w-6" tileClassName="bg-cyan-100 text-cyan-700 p-2" />
              <p className="text-sm font-medium text-ink-600">{t('product.contactForSpecs')}</p>
            </div>
          ))}

        {active === 'description' && description && (
          <div className={`${tabPanel} p-7`}>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">{t('product.description')}</h2>
            <div className="mt-4 max-w-none">{renderParagraphs(description)}</div>
          </div>
        )}

        {active === 'faq' && faq && faq.length > 0 && <ProductFaqAccordion faq={faq} />}
      </div>
    </div>
  );
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
  const faq = (product.faq as FaqItem[] | null) ?? null;
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';
  const categorySlug = category?.slug || '';

  const images = product.images && product.images.length ? product.images : ['/images/og-default.svg'];
  const [activeImage, setActiveImage] = useState(images[0]);

  // V42: click-to-zoom lightbox (hand-built, no third-party dependency).
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (index: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    setLightboxIndex(clamped);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const stepLightbox = (dir: number) => {
    if (images.length <= 1) return;
    setLightboxIndex((i) => (i + dir + images.length) % images.length);
  };
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') stepLightbox(-1);
      else if (e.key === 'ArrowRight') stepLightbox(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  return (
    <div className="relative min-h-screen bg-glass-light-cold">
      {/* V47: cold-tone fireworks backdrop behind the product detail content. */}
      <Fireworks count={14} />

      {/* Soft colour blooms so the glass tabs/cards have something to refract.
          V44: unified to the ice-blue crystal palette (cyan / sky). */}
      <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
        <div className="absolute -top-24 start-0 h-[420px] w-[420px] rounded-full bg-cyan-400/[0.14] blur-3xl" />
        <div className="absolute top-1/4 end-0 h-[460px] w-[460px] rounded-full bg-sky-400/[0.12] blur-3xl" />
      </div>
      {/* Rising bubbles — light variant for the bright background. */}
      <OceanBubbles tone="light" className="-z-10" />
      {/* Bottom ocean waves for depth */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 overflow-hidden" aria-hidden="true">
        <div className="ocean-wave ocean-wave--1" />
        <div className="ocean-wave ocean-wave--2" />
        <div className="ocean-wave ocean-wave--3" />
      </div>

      <div className="container-qtech relative z-10 py-10 lg:py-14">
        {/* Back to products */}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-cyan-700"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          {t('product.backToProducts')}
        </Link>

        {/* Breadcrumb */}
        <nav className="mb-6 mt-4 text-sm text-ink-400">
          <Link href={`/${locale}`} className="transition-colors hover:text-cyan-700">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/products`} className="transition-colors hover:text-cyan-700">{t('nav.products')}</Link>
          {categorySlug && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/${locale}/category/${categorySlug}`} className="transition-colors hover:text-cyan-700">
                {categoryName}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery — sticky on desktop so the main image stays in view while scrolling specs/description */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <OceanGlassCard ripple surface="glass" depth="lg" hoverLift={false} rippleRings={3} ripplePointer rippleColor="rgba(56,189,248,0.28)" className="relative overflow-hidden rounded-[24px] p-2.5 sm:p-3 shadow-[0_24px_60px_-18px_rgba(2,6,23,0.30)] ring-1 ring-white/60">
              {/* Ocean top accent bar — card memory point */}
              <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" aria-hidden="true" />
              <div
                className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[20px] bg-slate-100"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent)',
                  maskImage: 'linear-gradient(to bottom, #000 80%, transparent)',
                }}
                role="button"
                tabIndex={0}
                aria-label={t('product.zoom') || 'View larger image'}
                onClick={() => openLightbox(images.indexOf(activeImage))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(images.indexOf(activeImage));
                  }
                }}
              >
                {/* V49.7: quality=100 + sharp edges so the product shot stays crisp. */}
                <ImageWithRetry src={activeImage} alt={name} loading="eager" fetchPriority="high" quality={100} className="h-full w-full object-cover" />
              </div>
            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => {
                      setActiveImage(img);
                      openLightbox(images.indexOf(img));
                    }}
                    aria-label={name}
                    aria-pressed={activeImage === img}
                    className={`group relative h-20 w-20 overflow-hidden rounded-xl border-2 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 ${
                      activeImage === img ? 'border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)] scale-[1.04]' : 'border-slate-200 hover:border-cyan-400 hover:shadow-sm'
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
              <span className="inline-flex w-fit items-center rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-700">
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

            {/* V41: Specifications / Key Features / Description combined into a
                single dark-glass Tab switcher (default first tab = Key Features). */}
            <ProductDetailTabs
              specs={specs}
              features={product.features}
              description={description}
              faq={faq}
              t={t}
            />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <RevealOnScroll as="section" className="mt-14 md:mt-20">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">{t('product.related')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} ocean />
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* Lightbox — click any product image to zoom (hand-built, no deps) */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={name}
          >
            {/* V50: close button made clearly visible — solid brand-cyan fill,
                white X, white ring + drop shadow, lifted above the image so it
                is always perceptible and clickable. Overlay-click + ESC still
                close the lightbox (see handlers above). */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label={t('product.close') || 'Close'}
              className="absolute end-4 top-4 z-[75] inline-flex h-11 w-11 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg shadow-black/40 ring-2 ring-white/80 transition hover:bg-cyan-500 hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            >
              <X className="h-6 w-6" />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stepLightbox(-1);
                }}
                aria-label={t('product.prev') || 'Previous'}
                className="absolute start-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rtl:-scale-x-100"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stepLightbox(1);
                }}
                aria-label={t('product.next') || 'Next'}
                className="absolute end-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rtl:-scale-x-100"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}

            <div className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <ImageWithRetry
                src={images[lightboxIndex]}
                alt={`${name} ${lightboxIndex + 1}`}
                width={1200}
                height={900}
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                draggable={false}
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
