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

// Real deployment / application scenes built from video-extracted frames
// (scripts/extract-video-frames.py -> public/images/cases/*.webp).
// NOTE: Arabic (ar) copy mirrors English as a placeholder — pending human review.
const CASES: CaseItem[] = [
  {
    image: '/images/cases/flower-vending-feedback.webp',
    title: { en: 'Fresh-Flower Kiosk', zh: '鲜花自助站', ar: 'Fresh-Flower Kiosk' },
    sub: {
      en: 'On-demand bouquets for commuters and last-minute gifts.',
      zh: '为通勤族与临时送礼提供即时鲜花。',
      ar: 'On-demand bouquets for commuters and last-minute gifts.',
    },
  },
  {
    image: '/images/cases/feedback.webp',
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: '24/7 Campus Pizza' },
    sub: {
      en: 'Serving students late-night on a European campus.',
      zh: '为欧洲校园师生提供深夜热食。',
      ar: 'Serving students late-night on a European campus.',
    },
  },
  {
    image: '/images/cases/ice-cream-vending.webp',
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'Branded Ice-Cream Robot' },
    sub: {
      en: 'OEM branding for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制。',
      ar: 'OEM branding for a Middle-East retail chain.',
    },
  },
  {
    image: '/images/cases/feedback-video-1.webp',
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'Office Coffee Corner' },
    sub: {
      en: 'Energy-saving coffee in corporate lobbies.',
      zh: '企业大堂的节能咖啡方案。',
      ar: 'Energy-saving coffee in corporate lobbies.',
    },
  },
  {
    image: '/images/cases/feedback-in-hospital.webp',
    title: { en: 'Hospital Lobby', zh: '医院大堂', ar: 'Hospital Lobby' },
    sub: {
      en: 'Round-the-clock snacks and drinks for patients and visitors.',
      zh: '为患者与访客提供全天候零食与饮品。',
      ar: 'Round-the-clock snacks and drinks for patients and visitors.',
    },
  },
  {
    image: '/images/cases/pet-wash-demo.webp',
    title: { en: 'Pet Spa on the Street', zh: '街头宠物洗护站', ar: 'Pet Spa on the Street' },
    sub: {
      en: 'Self-service pet wash in a residential district.',
      zh: '社区中的自助宠物洗护。',
      ar: 'Self-service pet wash in a residential district.',
    },
  },
];

/**
 * CasesSection (V30 Ocean) — replaces the old PartnersSection. Uses the
 * video-extracted frames as real, tangible deployment proof inside ocean-glass
 * cards with a hover ripple. Section header reuses the existing
 * home.partners.* copy so it stays consistent with the rest of the page.
 */
export default function CasesSection() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="bg-gradient-to-b from-ocean-50/40 to-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.partners.eyebrow')}</p>
          <h2 className="section-title">{t('home.partners.title')}</h2>
          <p className="section-subtitle">{t('home.partners.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c, i) => (
            <RevealOnScroll key={c.image} delay={i * 80} className="h-full">
              <OceanGlassCard ripple depth="md" className="h-full rounded-2xl">
                <div className="group flex h-full flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
                    <ImageWithRetry
                      src={c.image}
                      alt={localized(c.title, locale)}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    {/* Darkening scrim so the floating info bar stays legible */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />

                    {/* Floating glass info bar — title + one-line description + arrow */}
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur-md">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {localized(c.title, locale)}
                        </p>
                        <p className="truncate text-[11px] leading-tight text-white/80">
                          {localized(c.sub, locale)}
                        </p>
                      </div>
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-ocean-500 to-brand-600 text-white shadow-sm transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
                        <span aria-hidden="true" className="text-base font-bold leading-none">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </OceanGlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
