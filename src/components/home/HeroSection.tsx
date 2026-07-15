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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-50 to-white">
      {/* Brand-blue soft glow */}
      <div className="tech-glow" />

      <div className="container-qtech relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm border border-brand-100">
            {t('home.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
            {t('home.hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-600">{t('home.hero.subtitle')}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {t('home.hero.tagline')}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/products`}
              className="btn-primary px-7 py-3 text-sm"
            >
              {t('home.hero.ctaBrowse')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {t('home.hero.ctaContact')}
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            {stats.map((s) => (
              <div key={s.labelKey}>
                <dt className="text-3xl font-bold text-brand-700">
                  <CountUp end={s.end} suffix={s.suffix} />
                </dt>
                <dd className="mt-1 text-sm text-ink-500">{t(s.labelKey)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column: live product carousel */}
        <div className="hidden lg:block">
          {current ? (
            <div className="pro-card relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl shadow-xl">
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
                  <span className="text-xs font-medium uppercase tracking-wide text-brand-100">
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
                        i === index ? 'bg-brand-600' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="pro-card mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center rounded-3xl border border-slate-200 text-center">
              <span className="text-lg font-semibold text-ink-700">{t('home.hero.featuredLabel')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
