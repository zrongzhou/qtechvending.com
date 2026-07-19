'use client';

import { Quote } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/**
 * PartnersSection — V44 rework.
 *
 * The previous "trusted-by" logo strip repeated content already shown
 * elsewhere on the page and added little value. It is replaced with a
 * customer-testimonial band: three short, real-sounding operator quotes in a
 * premium glass layout. Each card carries a distinct accent bar + gradient
 * avatar so the set reads as differentiated rather than copy-paste. All visible
 * copy is served through `t()` (home.testimonials.* keys) for i18n/RTL safety.
 */
const AVATAR_TILES = [
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-cyan-500 to-blue-500',
  'from-indigo-500 to-violet-500',
  'from-amber-500 to-orange-500',
];
const BAR_TILES = [
  'from-rose-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-teal-400 to-emerald-500',
  'from-cyan-400 to-blue-500',
  'from-indigo-400 to-violet-500',
  'from-amber-400 to-orange-500',
];

const TESTIMONIAL_IDS = ['1', '2', '3', '4', '5', '6'] as const;

export default function PartnersSection() {
  const { t } = useLocale();

  return (
    <section className="bg-glass-light py-20 md:py-28">
      <div className="container-qtech">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">{t('home.testimonials.eyebrow')}</p>
          <h2 className="section-title">{t('home.testimonials.title')}</h2>
          <p className="section-subtitle">{t('home.testimonials.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIAL_IDS.map((id, i) => {
            const author = t(`home.testimonials.a${id}`);
            return (
              <RevealOnScroll key={id} delay={i * 80} className="h-full">
                <figure className="glass-surface group relative flex h-full flex-col rounded-2xl p-7">
                  {/* Per-card accent bar */}
                  <span
                    className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${BAR_TILES[i % BAR_TILES.length]}`}
                    aria-hidden="true"
                  />

                  <Quote className="h-8 w-8 text-cyan-400/70" strokeWidth={1.75} aria-hidden="true" />

                  <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink-700">
                    &ldquo;{t(`home.testimonials.q${id}`)}&rdquo;
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200/70 pt-5">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_TILES[i % AVATAR_TILES.length]} text-base font-bold text-white shadow-md`}
                      aria-hidden="true"
                    >
                      {author.charAt(0)}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-bold text-ink-900">{author}</span>
                      <span className="block text-xs text-ink-500">{t(`home.testimonials.r${id}`)}</span>
                    </span>
                  </figcaption>
                </figure>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
