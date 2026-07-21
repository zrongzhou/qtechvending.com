'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Factory } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/** Ordered factory / workshop photos (converted to webp in public/images/factory). */
const FACTORY_IMAGES = Array.from(
  { length: 9 },
  (_, i) => `/images/factory/factory-${String(i + 1).padStart(2, '0')}.webp`
);

export default function FactoryShowcase() {
  const { t, locale } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = FACTORY_IMAGES.length;

  const go = (n: number) => setIndex(((n % count) + count) % count);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(id);
  }, [paused, count]);

  const caption = (i: number) => {
    const m = {
      en: `Workshop ${i + 1}`,
      zh: `生产车间 ${i + 1}`,
      ar: `ورشة العمل ${i + 1}`,
    };
    return m[locale] ?? m.en;
  };

  const title =
    locale === 'zh'
      ? '工厂车间实拍'
      : locale === 'ar'
        ? 'جولة في مصنعنا'
        : 'Inside Our Factory';
  const subtitle =
    locale === 'zh'
      ? '从钣金加工到整机组装，每一道工序都可见、可追溯——专业制造实力的真实缩影。'
      : locale === 'ar'
        ? 'من تشكيل المعادن إلى التجميع النهائي، كل خطوة واضحة وقابلة للتتبع — لمحة حقيقية عن قدراتنا التصنيعية.'
        : 'From sheet-metal work to final assembly, every step is visible and traceable — a real glimpse of our manufacturing strength.';

  return (
    <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="brand-plaque gap-2">
          <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
          {locale === 'zh' ? '智造实景' : locale === 'ar' ? 'جولة تصنيعية' : 'Manufacturing Floor'}
        </span>
        <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-600">{subtitle}</p>
      </div>

      {/* Glass-framed slideshow */}
      <div
        className="group relative mt-12 overflow-hidden rounded-3xl bg-white/40 p-2 shadow-lift ring-1 ring-white/70 backdrop-blur-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
          {FACTORY_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={caption(i)}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Soft gradient scrim for control legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-slate-900/10" />

          {/* Prev / Next */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="previous"
            className="absolute start-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur transition hover:bg-white hover:text-cyan-700 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="next"
            className="absolute end-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md backdrop-blur transition hover:bg-white hover:text-cyan-700 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 end-4 rounded-full bg-slate-900/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Thumbnail navigation — V49.9④: hidden per request (the preview row
          under the slideshow is no longer wanted). */}
      <div className="no-scrollbar mt-5 hidden flex gap-3 overflow-x-auto pb-1">
        {FACTORY_IMAGES.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => go(i)}
            aria-label={caption(i)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
              i === index
                ? 'border-cyan-500 ring-2 ring-cyan-300'
                : 'border-white/70 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={src} alt={caption(i)} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </RevealOnScroll>
  );
}
