'use client';

import { Globe, Users, CalendarClock, Boxes, type LucideIcon } from 'lucide-react';
import { useLocale, type Locale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';

// V33: each stat gets its own accent (blue-cyan / amber-orange / emerald-green /
// violet-purple) — gradient number, thin coloured left-border, glowing dot.
const STAT_ACCENTS = [
  { border: 'border-blue-400', grad: 'from-blue-500 to-cyan-500', dot: 'bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.7)]', icon: 'text-blue-500' },
  { border: 'border-amber-400', grad: 'from-amber-400 to-orange-500', dot: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]', icon: 'text-amber-500' },
  { border: 'border-emerald-400', grad: 'from-emerald-400 to-green-500', dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]', icon: 'text-emerald-500' },
  { border: 'border-violet-400', grad: 'from-violet-500 to-purple-600', dot: 'bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.7)]', icon: 'text-violet-500' },
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
                {/* Soft colored glow behind the glass stat card */}
                <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-20 blur-xl ${accent.grad}`} aria-hidden="true" />
                <OceanGlassCard
                  depth="sm"
                  hoverLift
                  className={`group relative z-10 h-full overflow-hidden border-s-4 ${accent.border}`}
                >
                  <div className="flex h-full flex-col items-center gap-3 px-5 py-8 text-center">
                    <div className="flex items-center gap-2">
                      {/* Subtle glowing accent dot next to the icon */}
                      <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} aria-hidden="true" />
                      <IconTile icon={Icon} className="h-6 w-6" tileClassName={accent.icon} animate="float" />
                    </div>
                    {/* Gradient-clipped, larger, slowly-travelling number in the
                        card's accent colour so the figure feels alive. */}
                    <div className={`stat-number-anim flex items-baseline gap-0.5 bg-gradient-to-r bg-clip-text text-5xl font-extrabold text-transparent ${accent.grad}`}>
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
