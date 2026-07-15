'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { SOLUTIONS } from '@/lib/solutions-data';

/** Banner image per solution id (generated visuals in public/images/solutions). */
const SOLUTION_IMAGES: Record<string, string> = {
  'factory-tools': '/images/solutions/factory-tools.webp',
  'office-stationery': '/images/solutions/office-stationery.webp',
  'electronic-components': '/images/solutions/electronic-components.webp',
  'medical-supply': '/images/solutions/medical-supply.webp',
  'food-beverage': '/images/solutions/food-beverage.webp',
  'ppe-safety': '/images/solutions/ppe-safety.webp',
};

/**
 * Renders the Solutions page: a localized hero header, a responsive grid of
 * image cards (one per solution scenario, each with a banner photo + gradient
 * overlay) and a closing CTA band.
 */
export default function SolutionsGrid() {
  const { t, locale } = useLocale();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
      <div className="container-qtech py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            {t('solutions.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-ink-900">{t('solutions.title')}</h1>
          <p className="mt-4 text-lg text-ink-500">{t('solutions.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            const img = SOLUTION_IMAGES[s.id];
            return (
              <div
                key={s.id}
                className="glass-card group flex flex-col overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Banner image with gradient overlay */}
                <div className="relative h-44 w-full overflow-hidden">
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={localized(s.title, locale)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/30 to-transparent" />
                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-brand-600 shadow-md backdrop-blur">
                    <Icon className="h-5 w-5" />
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
            );
          })}
        </div>

        {/* Closing CTA band */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('solutions.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/90">{t('solutions.ctaSubtitle')}</p>
          <Link
            href={`/${locale}/contact`}
            className="mt-8 inline-flex rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            {t('solutions.ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
