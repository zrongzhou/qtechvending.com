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

// Per-card accent identity (V35) — rotates cyan / emerald / violet / amber /
// rose / sky so the solution grid no longer looks like identical brand cards.
const SOLUTION_ACCENTS = [
  { tile: 'from-cyan-500 to-blue-600', bar: 'from-cyan-400 to-blue-600', tag: 'bg-cyan-50 text-cyan-700', hover: 'hover:shadow-cyan-500/30' },
  { tile: 'from-emerald-500 to-teal-600', bar: 'from-emerald-400 to-teal-600', tag: 'bg-emerald-50 text-emerald-700', hover: 'hover:shadow-emerald-500/30' },
  { tile: 'from-violet-500 to-purple-600', bar: 'from-violet-400 to-purple-600', tag: 'bg-violet-50 text-violet-700', hover: 'hover:shadow-violet-500/30' },
  { tile: 'from-amber-500 to-orange-600', bar: 'from-amber-400 to-orange-600', tag: 'bg-amber-50 text-amber-700', hover: 'hover:shadow-amber-500/30' },
  { tile: 'from-rose-500 to-pink-600', bar: 'from-rose-400 to-pink-600', tag: 'bg-rose-50 text-rose-700', hover: 'hover:shadow-rose-500/30' },
  { tile: 'from-sky-500 to-indigo-600', bar: 'from-sky-400 to-indigo-600', tag: 'bg-sky-50 text-sky-700', hover: 'hover:shadow-sky-500/30' },
];

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
        <RevealOnScroll className="section-head">
          <p className="eyebrow">{t('solutions.badge')}</p>
          <h1 className="section-title">{t('solutions.title')}</h1>
          <p className="section-subtitle">{t('solutions.subtitle')}</p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => {
            const Icon = s.icon;
            const img = SOLUTION_IMAGES[s.id];
            const a = SOLUTION_ACCENTS[i % SOLUTION_ACCENTS.length];
            return (
              <RevealOnScroll key={s.id} delay={i * 80} className="h-full">
                <div className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100/80 bg-white p-0 shadow-md transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl ${a.hover}`}>
                  {/* Top accent bar — per-card identity colour */}
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.bar}`} aria-hidden="true" />

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
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.tile} text-white shadow-md p-2.5`} />
                    </span>
                    <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold leading-tight text-white drop-shadow">
                      {localized(s.title, locale)}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm leading-relaxed text-ink-500">{localized(s.description, locale)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.tags[locale]?.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${a.tag}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${a.tile}`}
                            aria-hidden="true"
                          />
                          {localized(f, locale)}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/${locale}${s.href}`}
                      className={`group/learn mt-6 inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80 ${'text-cyan-700'}`}
                    >
                      {t('solutions.learnMore')}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover/learn:translate-x-1 rtl:-scale-x-100 rtl:group-hover/learn:-translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* Closing CTA band */}
        <RevealOnScroll className="mt-16 overflow-hidden rounded-3xl bg-brand-50 px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t('solutions.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-600">{t('solutions.ctaSubtitle')}</p>
          <Link
            href={`/${locale}/contact`}
            className="btn-primary mt-8"
          >
            {t('solutions.ctaButton')}
          </Link>
        </RevealOnScroll>
      </div>
    </div>
  );
}
