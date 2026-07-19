'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// V47: 14 real customer-installation photos (WebP, max-width 800, q80).
const GALLERY = Array.from(
  { length: 14 },
  (_, i) => `/images/cases/gallery-${i + 1}.webp`,
);

/**
 * CaseGallerySection (V47) — a masonry (CSS columns) grid of real customer
 * installation photos for the About page. Each tile is click-to-zoom via a
 * hand-built lightbox (no third-party dependency). i18n drives the heading and
 * the per-image alt prefix; images keep their natural aspect ratios so the
 * columns read as an organic, staggered masonry wall.
 */
export default function CaseGallerySection() {
  const { t, locale } = useLocale();
  const altPrefix =
    t('about.caseGallery.altPrefix') || 'Qtech vending installation case ';
  const title = t('about.caseGallery.title') || 'Customer Cases';

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const close = () => setOpen(false);
  const step = (dir: number) =>
    setIndex((i) => (i + dir + GALLERY.length) % GALLERY.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <section className="container-qtech py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          {locale === 'zh' ? '客户现场' : locale === 'ar' ? 'مواقع العملاء' : 'In the Field'}
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {title}
        </h2>
      </div>

      {/* Masonry via CSS columns. break-inside-avoid keeps each tile intact;
          natural image ratios produce the staggered "错落" layout. */}
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {GALLERY.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`${altPrefix}${i + 1}`}
            className="group mb-4 block w-full break-inside-avoid cursor-pointer overflow-hidden rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${altPrefix}${i + 1}`}
              loading="lazy"
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox — hand-built, no dependencies (pattern reused from V42). */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            onClick={close}
            aria-label={t('product.close') || 'Close'}
            className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label={t('product.prev') || 'Previous'}
            className="absolute start-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rtl:-scale-x-100"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label={t('product.next') || 'Next'}
            className="absolute end-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rtl:-scale-x-100"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          <div className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GALLERY[index]}
              alt={`${altPrefix}${index + 1}`}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              draggable={false}
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            {index + 1} / {GALLERY.length}
          </div>
        </div>
      )}
    </section>
  );
}
