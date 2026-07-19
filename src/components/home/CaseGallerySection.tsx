'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from '@/lib/i18n';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// V47: 14 real customer-installation photos (WebP, max-width 800, q80).
const GALLERY = Array.from(
  { length: 14 },
  (_, i) => `/images/cases/gallery-${i + 1}.webp`,
);

/**
 * CaseGallerySection (V48, R6) — a cinematic "screen" player for the customer
 * installation photos. A large 16:9 stage cross-fades between images every 5s;
 * a horizontal thumbnail strip below lets users jump to any photo (the active
 * one is highlighted); on-screen left/right arrows provide manual control; and a
 * semi-transparent info bar overlays the current image title. A click opens the
 * original hand-built lightbox. All copy is i18n-driven; the layout is fully
 * responsive (the stage simply shrinks on mobile).
 */
export default function CaseGallerySection() {
  const { t, locale } = useLocale();
  const altPrefix =
    t('about.caseGallery.altPrefix') || 'Qtech vending installation case ';
  const title = t('about.caseGallery.title') || 'Customer Cases';
  const viewLabel = t('about.caseGallery.viewLabel') || 'Customer Case';

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const total = GALLERY.length;
  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + total) % total),
    [total],
  );
  const jump = (i: number) => setActive(i);

  // Auto-rotate every 5s with a soft cross-fade (paused while lightbox open).
  useEffect(() => {
    if (open) return;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [open, go]);

  // Keyboard support for the lightbox.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
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

      {/* Screen / main stage */}
      <div className="mt-12 overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-2xl shadow-brand-500/10 ring-1 ring-black/5 backdrop-blur-md">
        <div className="relative aspect-[16/9] w-full bg-slate-100">
          {GALLERY.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setActive(i);
                setOpen(true);
              }}
              aria-label={`${altPrefix}${i + 1}`}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-out ${
                i === active ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${altPrefix}${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-contain p-2"
              />
            </button>
          ))}

          {/* Left / right arrows */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('product.prev') || 'Previous'}
            className="absolute start-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-ink-800 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rtl:-scale-x-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('product.next') || 'Next'}
            className="absolute end-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-ink-800 shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rtl:-scale-x-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Info bar overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-900/80 via-ink-900/35 to-transparent p-5 text-start rtl:text-end">
            <p className="text-sm font-semibold text-white">
              {viewLabel} {active + 1}
            </p>
            <p className="mt-0.5 text-xs text-white/75">
              {altPrefix}
              {active + 1}
            </p>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="no-scrollbar flex gap-3 overflow-x-auto border-t border-slate-100 bg-white/50 p-3">
          {GALLERY.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => jump(i)}
              aria-label={`${altPrefix}${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === active
                  ? 'ring-cyan-500 shadow-md'
                  : 'opacity-70 ring-transparent hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox — hand-built, no dependencies (pattern reused from V42). */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('product.close') || 'Close'}
            className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
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
              go(-1);
            }}
            aria-label={t('product.next') || 'Next'}
            className="absolute end-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rtl:-scale-x-100"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          <div className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GALLERY[active]}
              alt={`${altPrefix}${active + 1}`}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              draggable={false}
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            {active + 1} / {total}
          </div>
        </div>
      )}
    </section>
  );
}
