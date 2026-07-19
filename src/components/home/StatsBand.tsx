'use client';

import { Globe, Users, CalendarClock, Boxes, type LucideIcon } from 'lucide-react';
import { useLocale, type Locale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';

// V45: unified to a calm, low-saturation "ice-blue crystal" family. Each card
// carries a 10%-tint background, a hairline border, a solid (non-gradient) number
// in the accent colour, a soft dot and a tinted icon — no high-saturation
// rainbow blocks, keeping the premium glassmorphism read.
const STAT_ACCENTS = [
  { tint: 'bg-cyan-500/10', border: 'border-cyan-200/50', num: 'text-cyan-600', dot: 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.45)]', icon: 'text-cyan-600' },
  { tint: 'bg-teal-500/10', border: 'border-teal-200/50', num: 'text-teal-600', dot: 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.45)]', icon: 'text-teal-600' },
  { tint: 'bg-sky-500/10', border: 'border-sky-200/50', num: 'text-sky-600', dot: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.45)]', icon: 'text-sky-600' },
  { tint: 'bg-indigo-500/10', border: 'border-indigo-200/50', num: 'text-indigo-600', dot: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.45)]', icon: 'text-indigo-600' },
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
    <RevealOnScroll as="section" className="bg-atmosphere-warm py-16 md:py-20">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.stats.eyebrow')}</p>
          <h2 className="section-title">{t('home.stats.title')}</h2>
          <p className="section-subtitle">{t('home.stats.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            const accent = STAT_ACCENTS[i];
            return (
              <div key={s.labelKey} className="relative h-full">
                <OceanGlassCard
                  depth="sm"
                  hoverLift
                  className={`group relative z-10 h-full overflow-hidden border ${accent.border}`}
                >
                  {/* Calm 10% accent tint sitting on the frosted glass. */}
                  <div className={`absolute inset-0 ${accent.tint}`} aria-hidden="true" />
                  <div className="relative flex h-full flex-col items-center gap-3 px-5 py-8 text-center">
                    <div className="flex items-center gap-2">
                      {/* Subtle glowing accent dot next to the icon */}
                      <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} aria-hidden="true" />
                      <IconTile icon={Icon} className="h-6 w-6" tileClassName={`bg-white/70 ${accent.icon}`} animate="float" />
                    </div>
                    {/* Solid (non-gradient) number in the card's accent colour —
                        calm and premium, no kindergarten rainbow. */}
                    <div className={`stat-number-anim flex items-baseline gap-0.5 text-5xl font-extrabold ${accent.num}`}>
                      <CountUp end={s.value} />
                      <span>{s.suffix}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink-700">{t(s.labelKey)}</p>
                    <p className="text-sm leading-relaxed text-ink-500">{s.desc[locale] ?? s.desc.en}</p>
                  </div>
                </OceanGlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </RevealOnScroll>
  );
}
