'use client';

import { useState, useEffect } from 'react';
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
import Starfield from '@/components/ui/Starfield';
import type { Product } from '@/types';

// A real, confirmed product photo used as the flagship hero visual so the
// first screen feels tangible and confident.
const HERO_FALLBACK =
  '/images/products/2025-popular-24-7-self-service-florist-flower-shop-vending-machine-sell-bouquet-of-rose/1.webp';

// V38: the rotating hero visuals are the six user-supplied product photos
// converted to 576×1024 portrait webp. The "View Details" CTA still points to
// the flagship product (products[0]) and is intentionally untouched.
const HERO_IMAGES = [
  '/images/hero/hero-product-1.webp', // 圆形花柜 (FLORALISTRY)
  '/images/hero/hero-product-2.webp', // 矩形 9 格花柜
  '/images/hero/hero-product-3.webp', // 宠物售货机（狗头造型）
  '/images/hero/hero-product-4.webp', // 零食薯条机 (SNACK UP)
  '/images/hero/hero-product-5.webp', // 三台白柜并排
  '/images/hero/hero-product-6.webp', // 黑色圆形花柜
];

// Descriptive alt text for each hero image, localised by locale.
function heroAlt(index: number, locale: string): string {
  const labels: Record<number, Record<string, string>> = {
    0: {
      zh: '圆形花柜 FLORALISTRY 鲜花自助售货机',
      en: 'Round floral cabinet — FLORALISTRY fresh-flower vending kiosk',
      ar: 'خزانة زهور دائرية — كشك بيع الزهور FLORALISTRY',
    },
    1: {
      zh: '矩形 9 格鲜花自助售货机',
      en: 'Rectangular 9-compartment flower vending machine',
      ar: 'آلة بيع الزهور المستطيلة بـ 9 أقسام',
    },
    2: {
      zh: '宠物造型智能售货机（狗头造型）',
      en: 'Pet-shaped smart vending machine (dog-head design)',
      ar: 'آلة بيع ذكية على شكل حيوان أليف (تصميم رأس كلب)',
    },
    3: {
      zh: '零食薯条机 SNACK UP',
      en: 'Snack and fries vending machine (SNACK UP)',
      ar: 'آلة بيع الوجبات الخفيفة والبطاطس (SNACK UP)',
    },
    4: {
      zh: '三台白柜并排展示',
      en: 'Three white vending cabinets side by side',
      ar: 'ثلاث خزائن بيضاء للبيع الآلي بجانب بعضها',
    },
    5: {
      zh: '黑色圆形花柜',
      en: 'Black round floral cabinet',
      ar: 'خزانة زهور دائرية سوداء',
    },
  };
  return labels[index]?.[locale] ?? labels[index]?.en ?? `Qtech product ${index + 1}`;
}

// Trust strip — four colourful glass micro-badges for instant B2B credibility.
const TRUST: {
  icon: LucideIcon;
  valueKey: string;
  labelKey: string;
  bar: string;
  tile: string;
}[] = [
  {
    icon: CalendarClock,
    valueKey: 'home.hero.trust1Value',
    labelKey: 'home.hero.trust1Label',
    bar: 'from-cyan-400 to-blue-500',
    tile: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Globe,
    valueKey: 'home.hero.trust2Value',
    labelKey: 'home.hero.trust2Label',
    bar: 'from-sky-400 to-cyan-500',
    tile: 'from-sky-500 to-cyan-600',
  },
  {
    icon: ShieldCheck,
    valueKey: 'home.hero.trust3Value',
    labelKey: 'home.hero.trust3Label',
    bar: 'from-teal-400 to-emerald-500',
    tile: 'from-teal-500 to-emerald-600',
  },
  {
    icon: Factory,
    valueKey: 'home.hero.trust4Value',
    labelKey: 'home.hero.trust4Label',
    bar: 'from-blue-400 to-indigo-500',
    tile: 'from-blue-500 to-indigo-600',
  },
];

/**
 * Flagship hero (V38): a cinematic starfield behind the value proposition, and
 * a 6-image auto-rotating product carousel on the right with fade + scale
 * transitions and dot indicators.
 */
export default function HeroSection({ products = [] }: { products?: Product[] }) {
  const { t, locale } = useLocale();

  const heroProduct = products[0];
  const heroName = heroProduct ? localized(heroProduct.name, locale) : '';
  const heroHref = heroProduct
    ? `/${locale}/products/${heroProduct.slug}`
    : `/${locale}/products`;
  const imageSrc = (heroProduct?.images?.[0] || HERO_FALLBACK) as string;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0a0e1a]">
      {/* Night-sky starfield canvas — lifted ABOVE the dark mask so the
          twinkling stars are clearly visible against the profound black sky.
          The canvas itself paints the deep-space base (#0a0e1a) so the hero is
          genuinely cosmic black with subtle nebula depth. */}
      {/* V41: star count cut ~30% (210 → 150) for a calmer, less-busy sky. */}
      <Starfield className="absolute inset-0 z-[1]" starCount={150} />

      {/* Dark gradient mask — keeps left-side white copy legible. Kept very
          transparent and BEHIND the starfield (z-0) so the bright stars shine
          through unobstructed. */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-r from-ink-950/80 via-ink-950/20 to-ink-950/5 sm:via-ink-950/15 sm:to-ink-950/5"
        aria-hidden="true"
      />

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
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
              {t('home.hero.tagline')}
            </p>
          </RevealOnScroll>

          {/* CTA group */}
          <RevealOnScroll delay={320} className="block">
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ocean-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ocean transition hover:-translate-y-0.5 hover:shadow-ocean-lg active:scale-[0.97] group"
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

          {/* Trust strip — colourful frosted-glass badges */}
          <RevealOnScroll delay={400} className="block">
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.valueKey}
                    className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur transition duration-300 hover:bg-white/10"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.bar}`}
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-center">
                      <IconTile
                        icon={Icon}
                        className="h-5 w-5"
                        tileClassName={`bg-gradient-to-br ${item.tile} text-white p-2 shadow-md`}
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

        {/* Right: 6-image auto-rotating carousel inside a glass card */}
        <RevealOnScroll delay={200} className="block">
          <div className="group relative">
            <div className="glass-dark relative overflow-hidden p-3 shadow-lift">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-2xl shadow-brand-300/20">
                {HERO_IMAGES.map((src, i) => (
                  <div
                    key={src}
                    className={`absolute inset-0 h-full w-full transition-[opacity,transform] duration-1000 ease-out ${
                      i === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                    }`}
                  >
                    <ImageWithRetry
                      src={src}
                      alt={heroAlt(i, locale)}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : undefined}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />

                {/* Dot indicators */}
                <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-2">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`${locale === 'zh' ? '切换到第' : locale === 'ar' ? 'الانتقال إلى' : 'Go to slide'} ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Link
                href={heroHref}
                className="absolute inset-x-4 bottom-12 inline-flex items-center justify-between gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-ink-900 shadow-lg backdrop-blur transition hover:bg-white"
              >
                <span className="line-clamp-1 text-sm font-semibold leading-tight">
                  {heroName || t('home.hero.featuredLabel')}
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-ocean-700">
                  {t('home.featured.viewDetails')}
                  <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
                </span>
              </Link>

              {/* Floating credibility badge */}
              <div className="float-soft absolute -start-4 -top-4 hidden items-center gap-2 rounded-2xl border border-white/15 bg-ink-900/80 px-4 py-2.5 shadow-lift backdrop-blur sm:inline-flex">
                <IconTile
                  icon={Star}
                  className="h-4 w-4"
                  tileClassName="bg-gradient-to-br from-ocean-500 to-brand-600 text-white p-1.5"
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
