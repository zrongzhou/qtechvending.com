'use client';

import { Globe, Users, CalendarClock, Boxes, type LucideIcon } from 'lucide-react';
import { useLocale, type Locale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';

// V13 polish round: animated "by the numbers" trust band.
// Reuses the brand design language (pro-card, IconTile, per-card accent, CountUp, hover lift).
const ACCENTS = [
  { bar: 'from-brand-400 to-brand-600', tile: 'bg-brand-50 text-brand-700' },
  { bar: 'from-amber-400 to-orange-500', tile: 'bg-amber-50 text-amber-600' },
  { bar: 'from-emerald-400 to-teal-500', tile: 'bg-emerald-50 text-emerald-600' },
  { bar: 'from-indigo-400 to-violet-500', tile: 'bg-indigo-50 text-indigo-600' },
];

const STATS: { value: number; suffix: string; icon: LucideIcon; labelKey: string; desc: Record<Locale, string> }[] = [
  {
    value: 80,
    suffix: '+',
    icon: Globe,
    labelKey: 'home.stats.countries',
    desc: {
      zh: '覆盖六大洲 80+ 国家和地区',
      en: 'Across 6 continents, 80+ countries & regions',
      ar: 'عبر 6 قارات وأكثر من 80 دولة ومنطقة',
    },
  },
  {
    value: 500,
    suffix: '+',
    icon: Users,
    labelKey: 'home.stats.partners',
    desc: {
      zh: '遍布全球的 500+ 合作伙伴',
      en: '500+ partners running Qtech worldwide',
      ar: 'أكثر من 500 شريك حول العالم',
    },
  },
  {
    value: 10,
    suffix: '+',
    icon: CalendarClock,
    labelKey: 'home.stats.years',
    desc: {
      zh: '十年智能售货研发与制造经验',
      en: 'A decade of smart-vending R&D',
      ar: 'عقد من تطوير آلات البيع الذكية',
    },
  },
  {
    value: 22,
    suffix: '',
    icon: Boxes,
    labelKey: 'home.stats.models',
    desc: {
      zh: '22+ 款标准化机型灵活可选',
      en: '22+ standard models to choose from',
      ar: 'أكثر من 22 طرازًا قياسيًا',
    },
  },
];

export default function StatsBand() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="bg-gradient-to-b from-ocean-50/40 to-white py-16 md:py-20">
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
              <OceanGlassCard key={s.labelKey} depth="sm" hoverLift className="group relative h-full overflow-hidden">
                <span
                  className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${ACCENTS[i].bar}`}
                  aria-hidden="true"
                />
                <div className="flex h-full flex-col items-center gap-2 px-4 py-8 text-center">
                  <IconTile icon={Icon} className="h-7 w-7" tileClassName={`${ACCENTS[i].tile} p-3`} animate="float" />
                  {/* Gradient-clipped number so the stat reads in ocean→brand colour */}
                  <div className="flex items-baseline gap-0.5 bg-gradient-to-br from-ocean-600 to-brand-600 bg-clip-text text-4xl font-extrabold text-transparent">
                    <CountUp end={s.value} />
                    <span>{s.suffix}</span>
                  </div>
                  <p className="text-sm font-semibold text-ink-700">{t(s.labelKey)}</p>
                  <p className="text-sm leading-relaxed text-ink-500">{s.desc[locale] ?? s.desc.en}</p>
                </div>
              </OceanGlassCard>
            );
          })}
        </div>
      </div>
    </RevealOnScroll>
  );
}
