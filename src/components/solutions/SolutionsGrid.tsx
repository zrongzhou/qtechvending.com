'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { SOLUTIONS } from '@/lib/solutions-data';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

/** Banner image per solution id (generated visuals in public/images/solutions). */
const SOLUTION_IMAGES: Record<string, string> = {
  'factory-tools': '/images/solutions/factory-tools.png',
  'office-stationery': '/images/solutions/office-stationery.png',
  'electronic-components': '/images/solutions/electronic-components.png',
  'medical-supply': '/images/solutions/medical-supply.png',
  'food-beverage': '/images/solutions/food-beverage.png',
  'ppe-safety': '/images/solutions/ppe-safety.png',
};

/**
 * Renders the Solutions page (Clean Premium): a localized hero header, a
 * responsive grid of light cards (one per solution scenario, each with a banner
 * photo + gradient overlay) and a closing CTA band.
 */
export default function SolutionsGrid() {
  const { t, locale } = useLocale();

  return (
    <div className="bg-white">
      <div className="container-qtech py-20 md:py-28">
        <div className="section-head">
          <p className="eyebrow">{t('solutions.badge')}</p>
          <h1 className="section-title">{t('solutions.title')}</h1>
          <p className="section-subtitle">{t('solutions.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => {
            const Icon = s.icon;
            const img = SOLUTION_IMAGES[s.id];
            return (
              <RevealOnScroll key={s.id} delay={i * 80} className="h-full">
                <div className="pro-card group flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lift">
                  {/* Top accent bar — visual anchor */}
                  <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-brand-400 to-brand-700" aria-hidden="true" />

                  {/* Banner image with gradient overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {img && (
                      <ImageWithRetry
                        src={img}
                        alt={localized(s.title, locale)}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
                    <span className="absolute start-4 top-4">
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName="bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md p-2.5" />
                    </span>
                    <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold leading-tight text-white drop-shadow">
                      {localized(s.title, locale)}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm text-ink-500">{localized(s.description, locale)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.tags[locale]?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                            aria-hidden="true"
                          />
                          {localized(f, locale)}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/${locale}${s.href}`}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-all hover:gap-2"
                    >
                      {t('solutions.learnMore')}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Closing CTA band */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-brand-50 px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t('solutions.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-600">{t('solutions.ctaSubtitle')}</p>
          <Link
            href={`/${locale}/contact`}
            className="btn-primary mt-8"
          >
            {t('solutions.ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
