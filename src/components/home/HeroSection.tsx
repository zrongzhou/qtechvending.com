'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';

export default function HeroSection() {
  const { t, locale } = useLocale();
  const stats = [
    { value: t('home.hero.stat1Value'), label: t('home.hero.stat1Label') },
    { value: t('home.hero.stat2Value'), label: t('home.hero.stat2Label') },
    { value: t('home.hero.stat3Value'), label: t('home.hero.stat3Label') },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M60 20 L64 48 L92 52 L64 56 L60 84 L56 56 L28 52 L56 48 Z" fill="#ffffff" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
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
              <div key={s.label}>
                <dt className="text-3xl font-bold">{s.value}</dt>
                <dd className="mt-1 text-sm text-white/80">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden lg:block">
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-white/10 p-8 backdrop-blur">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/10">
              <svg width="160" height="160" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 3 L27.2 20.8 L45 24 L27.2 27.2 L24 45 L20.8 27.2 L3 24 L20.8 20.8 Z" fill="#ffffff" />
                <path d="M40 8 L41.6 15.4 L49 17 L41.6 18.6 L40 26 L38.4 18.6 L31 17 L38.4 15.4 Z" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
