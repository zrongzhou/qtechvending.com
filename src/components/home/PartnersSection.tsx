'use client';

import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/**
 * PartnersSection — a horizontal "trusted by" logo strip for the home page.
 *
 * The `home.partners.*` i18n keys already exist; this component finally wires
 * them to a visible band. Logos are rendered as monogram glass chips that sit
 * desaturated by default and bloom into full colour on hover — a subtle,
 * premium glass treatment that matches the V43 light-glass system. (Replace
 * the placeholder partner list with real logo assets when available.)
 */
const PARTNERS = [
  { name: 'NordVend', mono: 'N' },
  { name: 'Pacific Retail', mono: 'P' },
  { name: 'BlueOcean Co', mono: 'B' },
  { name: 'MetroMart', mono: 'M' },
  { name: 'Sunrise Group', mono: 'S' },
  { name: 'Apex Trading', mono: 'A' },
  { name: 'Coral Distributors', mono: 'C' },
  { name: 'Prime Solutions', mono: 'R' },
];

const TILES = [
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-cyan-500',
  'from-teal-500 to-emerald-500',
  'from-fuchsia-500 to-pink-500',
  'from-indigo-500 to-blue-500',
];

export default function PartnersSection() {
  const { t } = useLocale();

  return (
    <section className="bg-glass-light py-20 md:py-28">
      <div className="container-qtech">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">{t('home.partners.eyebrow')}</p>
          <h2 className="section-title">{t('home.partners.title')}</h2>
          <p className="section-subtitle">{t('home.partners.subtitle')}</p>
        </div>

        {/* Horizontal scrolling logo strip — swipe on touch / trackpad. */}
        <div className="no-scrollbar flex gap-5 overflow-x-auto pb-4">
          {PARTNERS.map((p, i) => (
            <RevealOnScroll key={p.name} delay={i * 60} className="shrink-0">
              <div className="group flex h-28 w-44 flex-col items-center justify-center gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/10">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${TILES[i % TILES.length]} text-lg font-black text-white opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0`}
                  aria-hidden="true"
                >
                  {p.mono}
                </span>
                <span className="text-sm font-semibold text-ink-500 transition-colors duration-300 group-hover:text-ink-900">
                  {p.name}
                </span>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
