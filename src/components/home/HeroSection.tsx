'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  Globe,
  ShieldCheck,
  Factory,
  Star,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import IconTile from '@/components/ui/IconTile';
import type { Product } from '@/types';

// A real, confirmed product photo (public/images/products/...) used as the
// flagship hero visual so the first screen feels tangible and confident.
const HERO_FALLBACK =
  '/images/products/2025-popular-24-7-self-service-florist-flower-shop-vending-machine-sell-bouquet-of-rose/1.jpg';

// Trust strip — four brand-blue micro-badges for instant B2B credibility.
const TRUST: { icon: LucideIcon; valueKey: string; labelKey: string }[] = [
  { icon: CalendarClock, valueKey: 'home.hero.trust1Value', labelKey: 'home.hero.trust1Label' },
  { icon: Globe, valueKey: 'home.hero.trust2Value', labelKey: 'home.hero.trust2Label' },
  { icon: ShieldCheck, valueKey: 'home.hero.trust3Value', labelKey: 'home.hero.trust3Label' },
  { icon: Factory, valueKey: 'home.hero.trust4Value', labelKey: 'home.hero.trust4Label' },
];

/**
 * Flagship hero: a confident value proposition on the left, a real, floating
 * machine photo on the right, and a four-badge trust strip for instant
 * credibility — all in the professional tech-blue language of V12.
 */
export default function HeroSection({ products = [] }: { products?: Product[] }) {
  const { t, locale } = useLocale();

  const heroProduct = products[0];
  const heroName = heroProduct ? localized(heroProduct.name, locale) : '';
  const heroHref = heroProduct
    ? `/${locale}/products/${heroProduct.slug}`
    : `/${locale}/products`;
  const imageSrc = (heroProduct?.images?.[0] || HERO_FALLBACK) as string;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-50 to-white">
      {/* Brand-blue soft glow + breathing accent */}
      <div className="tech-glow" />
      <div className="brand-breathe pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />

      <div className="container-qtech relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* Left: value proposition */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm border border-brand-100">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            {t('home.badge')}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            {t('home.hero.title')}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            {t('home.hero.subtitle')}
          </p>

          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {t('home.hero.tagline')}
          </p>

          {/* CTA group */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/contact`}
              className="btn-primary group px-7 py-3.5 text-sm"
            >
              {t('home.hero.ctaPrimary')}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
            <a
              href="#machines"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-7 py-3.5 text-sm font-semibold text-brand-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {t('home.hero.ctaSecondary')}
            </a>
          </div>

          {/* Trust strip */}
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200 pt-6 sm:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.valueKey} className="flex items-center gap-2.5">
                  <IconTile
                    icon={Icon}
                    className="h-4 w-4 shrink-0"
                    tileClassName="bg-brand-50 text-brand-600 p-2"
                  />
                  <div className="leading-tight">
                    <dt className="text-sm font-extrabold tracking-tight text-ink-900">
                      {t(item.valueKey)}
                    </dt>
                    <dd className="text-xs text-ink-500">{t(item.labelKey)}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          {/* Mobile-only floating machine — desktop right column above is unchanged */}
          <div className="lg:hidden mt-10 max-w-sm mx-auto">
            <div className="relative mx-auto aspect-[4/5] w-full">
              {/* Breathing glow behind the machine */}
              <div className="brand-breathe absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-200/50 to-brand-400/30 blur-2xl" />
              <div className="float-y relative h-full w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl shadow-brand-700/10">
                <ImageWithRetry
                  src={imageSrc}
                  alt={heroName || t('home.hero.featuredLabel')}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />
                <Link
                  href={heroHref}
                  className="absolute inset-x-4 bottom-4 inline-flex items-center justify-between gap-2 rounded-xl bg-white/85 px-4 py-2.5 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
                >
                  <span className="line-clamp-1 text-sm font-semibold leading-tight">
                    {heroName || t('home.hero.featuredLabel')}
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    {t('home.featured.viewDetails')}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: floating real machine */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            {/* Breathing glow behind the machine */}
            <div className="brand-breathe absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-brand-200/50 to-brand-400/30 blur-2xl" />

            <div className="float-y relative h-full w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl shadow-brand-700/10">
              <ImageWithRetry
                src={imageSrc}
                alt={heroName || t('home.hero.featuredLabel')}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />

              <Link
                href={heroHref}
                className="absolute inset-x-4 bottom-4 inline-flex items-center justify-between gap-2 rounded-xl bg-white/85 px-4 py-2.5 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
              >
                <span className="line-clamp-1 text-sm font-semibold leading-tight">
                  {heroName || t('home.hero.featuredLabel')}
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                  {t('home.featured.viewDetails')}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>

            {/* Floating credibility chip */}
            <div
              className="float-y absolute -left-5 top-8 hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-2.5 shadow-xl backdrop-blur sm:inline-flex"
              style={{ animationDelay: '1.2s' }}
            >
              <IconTile
                icon={Star}
                className="h-4 w-4"
                tileClassName="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-1.5"
              />
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight text-ink-900">4.9 / 5</p>
                <p className="text-[11px] text-ink-500">500+ global partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
