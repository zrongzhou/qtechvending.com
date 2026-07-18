'use client';

import { Flower2, Pizza, Snowflake, Coffee, Apple, Dog, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import RippleOnHover from '@/components/ui/RippleOnHover';
import type { Locale } from '@/lib/i18n';

interface CaseItem {
  image: string;
  icon: LucideIcon;
  title: Record<Locale, string>;
  sub: Record<Locale, string>;
}

// V40: case image/title/sub are semantically consistent and each card now
// carries a refined icon that echoes the deployment, reinforcing the dark
// glass aesthetic that matches the Hero starfield.
const CASES: CaseItem[] = [
  {
    image: '/images/cases/case-1.webp',
    icon: Flower2,
    title: { en: 'Fresh-Flower Kiosk', zh: '鲜花自助站', ar: 'Fresh-Flower Kiosk' },
    sub: {
      en: 'On-demand bouquets for commuters and last-minute gifts.',
      zh: '为通勤族与临时送礼提供即时鲜花。',
      ar: 'On-demand bouquets for commuters and last-minute gifts.',
    },
  },
  {
    image: '/images/products/12-inch-pizza-outdoor-waterproof-sun-resistant-and-insulated-pizza-vending-machine-can-be-used-in-gas-station/1.webp',
    icon: Pizza,
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: '24/7 Campus Pizza' },
    sub: {
      en: 'Serving students late-night hot pizza on a European campus.',
      zh: '为欧洲校园师生提供深夜热披萨。',
      ar: 'Serving students late-night hot pizza on a European campus.',
    },
  },
  {
    image: '/images/products/different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized/1.webp',
    icon: Snowflake,
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'Branded Ice-Cream Robot' },
    sub: {
      en: 'OEM-branded ice-cream robot for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制冰淇淋机器人。',
      ar: 'OEM-branded ice-cream robot for a Middle-East retail chain.',
    },
  },
  {
    image: '/images/products/2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design/1.webp',
    icon: Coffee,
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'Office Coffee Corner' },
    sub: {
      en: 'Energy-saving coffee station for corporate lobbies and offices.',
      zh: '企业大堂与办公室的节能咖啡方案。',
      ar: 'Energy-saving coffee station for corporate lobbies and offices.',
    },
  },
  {
    image: '/images/products/smart-vending-machine-with-weighing-sensor-technology-selling-fruitvegetableeggsnack-and-cold-drink/1.webp',
    icon: Apple,
    title: { en: 'Hospital Lobby', zh: '医院大堂', ar: 'Hospital Lobby' },
    sub: {
      en: 'Round-the-clock snacks, drinks and fresh food for patients and visitors.',
      zh: '为患者与访客提供全天候零食、饮品与鲜食。',
      ar: 'Round-the-clock snacks, drinks and fresh food for patients and visitors.',
    },
  },
  {
    image: '/images/products/the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options/1.webp',
    icon: Dog,
    title: { en: 'Pet Spa on the Street', zh: '街头宠物洗护站', ar: 'Pet Spa on the Street' },
    sub: {
      en: 'Self-service pet wash station in a residential district.',
      zh: '社区中的自助宠物洗护站。',
      ar: 'Self-service pet wash station in a residential district.',
    },
  },
];

/**
 * CasesSection (V40) — dark glass cards that echo the Hero starfield palette.
 * Each card is a translucent dark surface with a refined per-case icon, a cyan
 * → teal top accent, a subtle water-ripple on hover, and a lift + brand glow.
 * The section itself sits on a deep-space background so the glass reads clearly.
 */
export default function CasesSection() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="relative overflow-hidden bg-[#0a0e1a] py-20 md:py-28">
      {/* Subtle deep-space nebula so the dark glass has colour to blur. */}
      <div
        className="pointer-events-none absolute -top-24 end-0 h-96 w-96 rounded-full bg-violet-700/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 start-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-qtech relative">
        <div className="section-head">
          <p className="eyebrow">{t('home.partners.eyebrow')}</p>
          <h2 className="section-title text-white">{t('home.partners.title')}</h2>
          <p className="section-subtitle text-white/70">{t('home.partners.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => {
            const Icon = c.icon;
            return (
              <RevealOnScroll key={c.image} delay={i * 100} className="h-full">
                <RippleOnHover
                  pointerDriven
                  rippleColor="rgba(34,211,238,0.22)"
                  rings={2}
                  className="group relative h-full glass-card-dark rounded-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Cyan → teal accent bar — ties Cases to the ocean/dark theme. */}
                  <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-500 to-teal-500" aria-hidden="true" />
                  <div className="group flex h-full flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-900/40">
                      <ImageWithRetry
                        src={c.image}
                        alt={localized(c.title, locale)}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {/* Darkening scrim so the floating info bar stays legible */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />

                      {/* Refined per-case icon badge */}
                      <span className="absolute start-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg ring-1 ring-white/20">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>

                      {/* Floating glass info bar — dark frosted treatment */}
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-lg backdrop-blur-md">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {localized(c.title, locale)}
                          </p>
                          <p className="truncate text-[11px] leading-tight text-white/60">
                            {localized(c.sub, locale)}
                          </p>
                        </div>
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
                          <span aria-hidden="true" className="text-lg font-bold leading-none">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </RippleOnHover>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </RevealOnScroll>
  );
}
