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
import RevealOnScroll from '@/components/ui/RevealOnScroll';
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
 * Flagship hero (Clean Premium): light brand-tinted backdrop with a soft brand
 * glow, a confident value proposition that reveals on load (staggered), and the
 * real product photo inside a soft glass card on the right that gently scales
 * on hover — no dark overlays, no heavy decoration.
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
    <section className="relative overflow-hidden bg-ink-950">
      {/* Soft brand glow — depth without heavy decoration */}
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Ambient motion — drifting brand orbs + gradient sheen (decorative, behind content) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-orb hero-orb--a -start-24 -top-24 h-72 w-72 bg-brand-300/40" />
        <div className="hero-orb hero-orb--b -end-20 top-8 h-80 w-80 bg-sky-300/40" />
        <div className="hero-orb hero-orb--c bottom-[-6rem] start-1/3 h-64 w-64 bg-teal-300/30" />
        <div className="hero-flow" />
      </div>

      {/* Full-bleed real product photo — moody backdrop on the ink base */}
      <div className="absolute inset-0" aria-hidden="true">
        <ImageWithRetry
          src={imageSrc}
          alt=""
          loading="eager"
          fetchPriority="high"
          className="object-cover opacity-40"
        />
      </div>
      {/* Dark gradient mask — keeps left-side white copy legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/70 sm:via-ink-950/85 sm:to-ink-950/40" aria-hidden="true" />

      <div className="container-qtech relative z-10 grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        {/* Left: value proposition */}
        <div>
          <RevealOnScroll className="block">
            <span className="eyebrow">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              {t('home.badge')}
            </span>
          </RevealOnScroll>

          <RevealOnScroll delay={90} className="block">
            <h1 className="mt-5 text-[clamp(34px,5vw,54px)] font-extrabold leading-[1.1] tracking-tight text-white">
              {t('home.hero.title')}
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={170} className="block">
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              {t('home.hero.subtitle')}
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={240} className="block">
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              {t('home.hero.tagline')}
            </p>
          </RevealOnScroll>

          {/* CTA group */}
          <RevealOnScroll delay={320} className="block">
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow-gold transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.97] group"
              >
                {t('home.hero.ctaPrimary')}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
              <a
                href="#machines"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10 active:scale-[0.97]"
              >
                {t('home.hero.ctaSecondary')}
              </a>
            </div>
          </RevealOnScroll>

          {/* Trust strip */}
          <RevealOnScroll delay={400} className="block">
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.valueKey} className="glass-dark">
                    <div className="flex items-center justify-center">
                      <IconTile
                        icon={Icon}
                        className="h-4 w-4"
                        tileClassName="bg-amber-400/15 text-amber-300 p-2"
                      />
                    </div>
                    <dt className="mt-2 text-sm font-extrabold tracking-tight text-white">
                      {t(item.valueKey)}
                    </dt>
                    <dd className="text-xs text-white/60">{t(item.labelKey)}</dd>
                  </div>
                );
              })}
            </dl>
          </RevealOnScroll>
        </div>

        {/* Right: real product visual inside a light glass card */}
        <RevealOnScroll delay={200} className="block">
          <div className="group relative">
            <div className="glass-dark relative overflow-hidden p-3 shadow-lift">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100">
                <ImageWithRetry
                  src={imageSrc}
                  alt={heroName || t('home.hero.featuredLabel')}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />

                <Link
                  href={heroHref}
                  className="absolute inset-x-4 bottom-4 inline-flex items-center justify-between gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
                >
                  <span className="line-clamp-1 text-sm font-semibold leading-tight">
                    {heroName || t('home.hero.featuredLabel')}
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    {t('home.featured.viewDetails')}
                    <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
                  </span>
                </Link>
              </div>

              {/* Floating credibility badge */}
              <div className="float-soft absolute -start-4 -top-4 hidden items-center gap-2 rounded-2xl border border-white/15 bg-ink-900/80 px-4 py-2.5 shadow-lift backdrop-blur sm:inline-flex">
                <IconTile
                  icon={Star}
                  className="h-4 w-4"
                  tileClassName="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-1.5"
                />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold tracking-tight text-white">4.9 / 5</p>
                  <p className="text-[11px] text-white/60">500+ global partners</p>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
