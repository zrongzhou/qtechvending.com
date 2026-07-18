'use client';

import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import type { Locale } from '@/lib/i18n';

interface CaseItem {
  image: string;
  title: Record<Locale, string>;
  sub: Record<Locale, string>;
}

// V38: case image/title/sub are now semantically consistent. Each image is a
// real product or deployment photo that matches the headline.
const CASES: CaseItem[] = [
  {
    image: '/images/cases/case-1.webp',
    title: { en: 'Fresh-Flower Kiosk', zh: '鲜花自助站', ar: 'Fresh-Flower Kiosk' },
    sub: {
      en: 'On-demand bouquets for commuters and last-minute gifts.',
      zh: '为通勤族与临时送礼提供即时鲜花。',
      ar: 'On-demand bouquets for commuters and last-minute gifts.',
    },
  },
  {
    image: '/images/products/12-inch-pizza-outdoor-waterproof-sun-resistant-and-insulated-pizza-vending-machine-can-be-used-in-gas-station/1.webp',
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: '24/7 Campus Pizza' },
    sub: {
      en: 'Serving students late-night hot pizza on a European campus.',
      zh: '为欧洲校园师生提供深夜热披萨。',
      ar: 'Serving students late-night hot pizza on a European campus.',
    },
  },
  {
    image: '/images/products/different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized/1.webp',
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'Branded Ice-Cream Robot' },
    sub: {
      en: 'OEM-branded ice-cream robot for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制冰淇淋机器人。',
      ar: 'OEM-branded ice-cream robot for a Middle-East retail chain.',
    },
  },
  {
    image: '/images/products/2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design/1.webp',
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'Office Coffee Corner' },
    sub: {
      en: 'Energy-saving coffee station for corporate lobbies and offices.',
      zh: '企业大堂与办公室的节能咖啡方案。',
      ar: 'Energy-saving coffee station for corporate lobbies and offices.',
    },
  },
  {
    image: '/images/products/smart-vending-machine-with-weighing-sensor-technology-selling-fruitvegetableeggsnack-and-cold-drink/1.webp',
    title: { en: 'Hospital Lobby', zh: '医院大堂', ar: 'Hospital Lobby' },
    sub: {
      en: 'Round-the-clock snacks, drinks and fresh food for patients and visitors.',
      zh: '为患者与访客提供全天候零食、饮品与鲜食。',
      ar: 'Round-the-clock snacks, drinks and fresh food for patients and visitors.',
    },
  },
  {
    image: '/images/products/the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options/1.webp',
    title: { en: 'Pet Spa on the Street', zh: '街头宠物洗护站', ar: 'Pet Spa on the Street' },
    sub: {
      en: 'Self-service pet wash station in a residential district.',
      zh: '社区中的自助宠物洗护站。',
      ar: 'Self-service pet wash station in a residential district.',
    },
  },
];

/**
 * CasesSection (V38) — real product/deployment photos mapped to matching
 * titles and subtitles. Uses ocean-glass cards with a hover ripple.
 */
export default function CasesSection() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="bg-atmosphere-rose py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.partners.eyebrow')}</p>
          <h2 className="section-title">{t('home.partners.title')}</h2>
          <p className="section-subtitle">{t('home.partners.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <RevealOnScroll key={c.image} delay={i * 100} className="h-full">
              <div className="relative h-full">
                {/* Soft orange-rose glow behind the glass case card */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 opacity-20 blur-xl" aria-hidden="true" />
                <OceanGlassCard ripple depth="md" className="group relative z-10 h-full rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lift">
                  {/* Warm accent bar — differentiates Cases from the ocean product cards */}
                  <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-orange-400 to-rose-500" aria-hidden="true" />
                  <div className="group flex h-full flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                      <ImageWithRetry
                        src={c.image}
                        alt={localized(c.title, locale)}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {/* Darkening scrim so the floating info bar stays legible */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />

                      {/* Floating glass info bar — stronger frosted treatment */}
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/85 px-3 py-2.5 shadow-lg backdrop-blur-md">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {localized(c.title, locale)}
                          </p>
                          <p className="truncate text-[11px] leading-tight text-ink-600">
                            {localized(c.sub, locale)}
                          </p>
                        </div>
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
                          <span aria-hidden="true" className="text-lg font-bold leading-none">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </OceanGlassCard>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
