'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// V47: 14 real customer-installation photos (WebP, max-width 800, q80).
const GALLERY = Array.from(
  { length: 14 },
  (_, i) => `/images/cases/gallery-${i + 1}.webp`,
);

/**
 * CaseGallerySection (V48.1, R7) — a full-width cinematic "screen" player for
 * the customer installation photos. The main stage spans the full available
 * width at a strict 16:9 and uses object-cover so images fill and crop with no
 * white/black borders; a uniform thumbnail strip (fixed height, equal aspect,
 * active ring) lets users jump to any photo; on-screen left/right arrows and a
 * semi-transparent info bar overlay the stage. A click opens the original
 * hand-built lightbox. All copy is trilingual; layout is fully responsive.
 */
export default function CaseGallerySection() {
  const { t, locale } = useLocale();
  const altPrefix =
    t('about.caseGallery.altPrefix') || 'Qtech vending installation case ';
  const title = t('about.caseGallery.title') || 'Customer Cases';
  const viewLabel = t('about.caseGallery.viewLabel') || 'Customer Case';

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});

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
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          {locale === 'zh' ? '客户现场' : locale === 'ar' ? 'مواقع العملاء' : 'In the Field'}
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
          {title}
        </h2>
      </div>

      {/* Screen / main stage — full width, strict 16:9, images fill & crop. */}
      <div className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-[20px] border border-white/70 bg-slate-900/5 shadow-[0_25px_60px_-18px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-black/5">
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
              {i === 0 ? (
                /* V49.4: first frame rendered as a plain <img> with eager +
                   synchronous decode + high fetch priority so it paints sharp
                   immediately and never depends on the Next.js image pipeline
                   (the previous first frame looked blurry). */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`${altPrefix}${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  onLoad={() => setImgLoaded((prev) => ({ ...prev, [i]: true }))}
                />
              ) : (
                <Image
                  src={src}
                  alt={`${altPrefix}${i + 1}`}
                  loading="lazy"
                  fill
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imgLoaded[i] || (i === active) ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  quality={100}
                  unoptimized
                  decoding="async"
                  onLoad={() => setImgLoaded((prev) => ({ ...prev, [i]: true }))}
                />
              )}
            </button>
          ))}

          {/* Left / right arrows — absolute, vertically centred, glassy. */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('product.prev') || 'Previous'}
            className="absolute start-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500/80 text-white shadow-lg backdrop-blur transition hover:bg-cyan-400 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rtl:-scale-x-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('product.next') || 'Next'}
            className="absolute end-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500/80 text-white shadow-lg backdrop-blur transition hover:bg-cyan-400 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rtl:-scale-x-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Info bar overlay — semi-transparent dark, floating on the stage. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black/40 p-5 text-start rtl:text-end">
            <p className="text-sm font-semibold text-white">
              {viewLabel} {active + 1}
            </p>
            <p className="mt-0.5 text-xs text-white/75">
              {altPrefix}
              {active + 1}
            </p>
          </div>
        </div>

        {/* Thumbnail strip — fixed height, uniform aspect, active ring. */}
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {GALLERY.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => jump(i)}
              aria-label={`${altPrefix}${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32 transition-transform duration-300 ${
                i === active
                  ? 'scale-[1.05] ring-[3px] ring-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.45),0_0_18px_rgba(34,211,238,0.5)]'
                  : 'scale-100 ring-1 ring-black/10 opacity-70 hover:opacity-100 hover:scale-[1.02]'
              }`}
            >
              <Image src={src} alt="" width={128} height={80} className="h-full w-full object-cover" quality={95} unoptimized />
            </button>
          ))}
        </div>
      </div>

      {/* V49: Preload gallery images via link[rel=prefetch] for instant lightbox.
          The hidden img layer was ineffective — browsers delay decoding display:none images. */}
      <div className="hidden" aria-hidden="true">
        {GALLERY.map((src) => (
          <link key={src} rel="prefetch" as="image" href={src} />
        ))}
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
            <Image
              src={GALLERY[active]}
              alt={`${altPrefix}${active + 1}`}
              width={1200}
              height={800}
              className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              quality={100}
              unoptimized  /* V48.7: bypass Next.js optimizer */
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
