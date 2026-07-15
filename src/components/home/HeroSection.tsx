'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import CountUp from '@/components/ui/CountUp';
import type { Product } from '@/types';

function firstImage(images: string[] | undefined): string {
  if (images && images.length > 0) return images[0];
  return '/images/og-default.svg';
}

export default function HeroSection({ products = [] }: { products?: Product[] }) {
  const { t, locale } = useLocale();

  const slides = products.slice(0, 6);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];
  const category = current?.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';
  const name = current ? localized(current.name, locale) : '';

  const stats = [
    { end: 11, suffix: '+', labelKey: 'home.hero.stat1Label' },
    { end: 60, suffix: '+', labelKey: 'home.hero.stat2Label' },
    { end: 24, suffix: '/7', labelKey: 'home.hero.stat3Label' },
  ];

  // Rising bubbles for the deep-ocean ambience.
  const bubbles = [
    { size: 6, left: 8, duration: 18, delay: 0, opacity: 0.18 },
    { size: 10, left: 18, duration: 24, delay: 4, opacity: 0.12 },
    { size: 4, left: 28, duration: 15, delay: 2, opacity: 0.2 },
    { size: 12, left: 42, duration: 28, delay: 6, opacity: 0.1 },
    { size: 7, left: 55, duration: 20, delay: 1, opacity: 0.15 },
    { size: 5, left: 68, duration: 16, delay: 8, opacity: 0.2 },
    { size: 9, left: 82, duration: 22, delay: 3, opacity: 0.12 },
  ];

  // Slowly drifting glowing plankton particles.
  const plankton = [
    { size: 3, left: 15, top: 30, duration: 12, delay: 0 },
    { size: 2, left: 35, top: 62, duration: 15, delay: 3 },
    { size: 4, left: 60, top: 24, duration: 14, delay: 1 },
    { size: 2.5, left: 78, top: 52, duration: 16, delay: 5 },
    { size: 3, left: 88, top: 72, duration: 13, delay: 2 },
  ];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          'linear-gradient(135deg, #0a1628 0%, #0c2340 35%, #0a1a4f 70%, #0d3b66 100%)',
      }}
    >
      {/* Light beam refracting from the surface */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="ocean-beam" />
        <div className="ocean-beam" style={{ left: '38%', animationDelay: '3s', opacity: 0.08 }} />
      </div>

      {/* Rising bubbles */}
      {bubbles.map((b, i) => (
        <span
          key={`bubble-${i}`}
          aria-hidden="true"
          className="ocean-bubble pointer-events-none"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            ['--bubble-opacity' as string]: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Drifting plankton particles */}
      {plankton.map((p, i) => (
        <span
          key={`plankton-${i}`}
          aria-hidden="true"
          className="ocean-particle pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Water ripples near the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <span className="ocean-ripple" style={{ bottom: '18px', animationDuration: '5s', animationDelay: '0s' }} />
        <span className="ocean-ripple" style={{ bottom: '8px', animationDuration: '7s', animationDelay: '1.5s' }} />
      </div>

      <div className="container-qtech relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            {t('home.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">{t('home.hero.subtitle')}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
            {t('home.hero.tagline')}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/products`}
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow transition hover:bg-brand-50"
            >
              {t('home.hero.ctaBrowse')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t('home.hero.ctaContact')}
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/20 pt-8">
            {stats.map((s) => (
              <div key={s.labelKey}>
                <dt className="text-3xl font-bold">
                  <CountUp end={s.end} suffix={s.suffix} />
                </dt>
                <dd className="mt-1 text-sm text-white/80">{t(s.labelKey)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column: live product carousel */}
        <div className="hidden lg:block">
          {current ? (
            <div className="glass-card-dark relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/30 shadow-2xl">
              <ImageWithRetry
                key={current.slug}
                src={firstImage(current.images)}
                alt={name}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/5 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                {categoryName && (
                  <span className="text-xs font-medium uppercase tracking-wide text-cyan-200">
                    {categoryName}
                  </span>
                )}
                <h3 className="mt-1 line-clamp-2 text-lg font-bold">{name}</h3>
                <Link
                  href={`/${locale}/products/${current.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-2 hover:underline"
                >
                  {t('home.featured.viewDetails')} →
                </Link>
              </div>

              {slides.length > 1 && (
                <div className="absolute right-4 top-4 flex gap-1.5">
                  {slides.map((p, i) => (
                    <button
                      key={p.slug}
                      type="button"
                      aria-label={`${t('home.featured.viewDetails')} ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-2 w-2 rounded-full transition ${
                        i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card-dark mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center rounded-3xl border border-white/30 bg-white/10 text-center backdrop-blur">
              <span className="text-lg font-semibold text-white/90">{t('home.hero.featuredLabel')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
