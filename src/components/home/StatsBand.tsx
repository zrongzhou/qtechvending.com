'use client';

import { Globe, Users, CalendarClock, Boxes, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

// V13 polish round: animated "by the numbers" trust band.
// Reuses the brand design language (pro-card, IconTile, per-card accent, CountUp, hover lift).
const ACCENTS = [
  { bar: 'from-brand-400 to-brand-600', tile: 'bg-brand-50 text-brand-700' },
  { bar: 'from-amber-400 to-orange-500', tile: 'bg-amber-50 text-amber-600' },
  { bar: 'from-emerald-400 to-teal-500', tile: 'bg-emerald-50 text-emerald-600' },
  { bar: 'from-indigo-400 to-violet-500', tile: 'bg-indigo-50 text-indigo-600' },
];

const STATS: { value: number; suffix: string; icon: LucideIcon; labelKey: string }[] = [
  { value: 80, suffix: '+', icon: Globe, labelKey: 'home.stats.countries' },
  { value: 500, suffix: '+', icon: Users, labelKey: 'home.stats.partners' },
  { value: 10, suffix: '+', icon: CalendarClock, labelKey: 'home.stats.years' },
  { value: 22, suffix: '', icon: Boxes, labelKey: 'home.stats.models' },
];

export default function StatsBand() {
  const { t } = useLocale();

  return (
    <RevealOnScroll as="section" className="bg-white py-16 md:py-20">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.stats.eyebrow')}</p>
          <h2 className="section-title">{t('home.stats.title')}</h2>
          <p className="section-subtitle">{t('home.stats.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.labelKey}
                className="pro-card group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl px-4 py-9 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${ACCENTS[i].bar}`}
                  aria-hidden="true"
                />
                <IconTile icon={Icon} className="h-7 w-7" tileClassName={`${ACCENTS[i].tile} p-3`} />
                <div className="flex items-baseline gap-0.5 text-4xl font-black text-ink-900">
                  <CountUp end={s.value} />
                  <span className="text-brand-700">{s.suffix}</span>
                </div>
                <p className="text-sm font-medium text-ink-500">{t(s.labelKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </RevealOnScroll>
  );
}
