'use client';

import { Factory, Clock, Settings2, Globe, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

// V16 polish: per-card accent palette + tinted card surfaces break monotonous teal.
// Each advantage gets its own identity while staying cohesive.
interface AccentTheme {
  bar: string; // top accent bar gradient
  tint: string; // icon tile tint
  hoverBorder: string; // card border colour on hover
  hoverTile: string; // icon tile darken on hover
  cardBg: string; // tinted card surface gradient
  watermark: string; // watermark number tint on hover
}

const ACCENTS: AccentTheme[] = [
  {
    bar: 'from-brand-400 to-brand-600',
    tint: 'bg-brand-50 text-brand-700',
    hoverBorder: 'hover:border-brand-300',
    hoverTile: 'group-hover:bg-brand-100',
    cardBg: 'from-brand-50/60 to-white',
    watermark: 'group-hover:text-brand-200',
  },
  {
    bar: 'from-amber-400 to-orange-500',
    tint: 'bg-amber-50 text-amber-600',
    hoverBorder: 'hover:border-amber-300',
    hoverTile: 'group-hover:bg-amber-100',
    cardBg: 'from-amber-50/60 to-white',
    watermark: 'group-hover:text-amber-200',
  },
  {
    bar: 'from-emerald-400 to-teal-500',
    tint: 'bg-emerald-50 text-emerald-600',
    hoverBorder: 'hover:border-emerald-300',
    hoverTile: 'group-hover:bg-emerald-100',
    cardBg: 'from-emerald-50/60 to-white',
    watermark: 'group-hover:text-emerald-200',
  },
  {
    bar: 'from-indigo-400 to-violet-500',
    tint: 'bg-indigo-50 text-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
    hoverTile: 'group-hover:bg-indigo-100',
    cardBg: 'from-indigo-50/60 to-white',
    watermark: 'group-hover:text-indigo-200',
  },
];

export default function AdvantagesSection() {
  const { t } = useLocale();
  const items: {
    number: number;
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
  }[] = [
    { number: 1, icon: Factory, titleKey: 'home.advantages.factoryDirect', descKey: 'home.advantages.factoryDirectDesc' },
    { number: 2, icon: Clock, titleKey: 'home.advantages.selfService', descKey: 'home.advantages.selfServiceDesc' },
    { number: 3, icon: Settings2, titleKey: 'home.advantages.oem', descKey: 'home.advantages.oemDesc' },
    { number: 4, icon: Globe, titleKey: 'home.advantages.globalShipping', descKey: 'home.advantages.globalShippingDesc' },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50/80 to-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.advantages.eyebrow')}</p>
          <h2 className="section-title">{t('home.advantages.title')}</h2>
          <p className="section-subtitle">{t('home.advantages.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            const accent = ACCENTS[i];
            return (
              <RevealOnScroll key={item.titleKey} delay={i * 80} className="h-full">
                <div
                  className={`pro-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${accent.cardBg} ${accent.hoverBorder}`}
                >
                  {/* Top accent bar — per-card identity colour */}
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${accent.bar}`} aria-hidden="true" />
                  {/* Big progressive step number */}
                  <span className={`absolute -end-2 -top-4 select-none text-7xl font-extrabold text-slate-100/15 transition-colors ${accent.watermark}`}>
                    <CountUp end={item.number} prefix="0" />
                  </span>

                  <div className="relative">
                    <IconTile
                      icon={Icon}
                      className="h-8 w-8 animate-icon-bounce"
                      tileClassName={`${accent.tint} p-4 transition-colors ${accent.hoverTile}`}
                    />
                    <h3 className="mt-4 text-xl font-bold text-ink-900">{t(item.titleKey)}</h3>
                    <p className="mt-2 text-sm text-ink-600">{t(item.descKey)}</p>
                  </div>

                  {/* Bottom decorative gradient line */}
                  <span className={`mt-auto block h-1 w-full rounded-full bg-gradient-to-r opacity-70 ${accent.bar}`} aria-hidden="true" />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
