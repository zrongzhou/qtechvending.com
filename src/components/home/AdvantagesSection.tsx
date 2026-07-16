'use client';

import { Factory, Clock, Settings2, Globe, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

// V13 polish #3: per-card accent palette breaks monotonous teal.
// Each advantage gets its own identity while staying cohesive.
const ACCENT_GRADIENTS = [
  'from-brand-400 to-brand-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-indigo-400 to-violet-500',
];
const ICON_TINTS = [
  'bg-brand-50 text-brand-600',
  'bg-amber-50 text-amber-600',
  'bg-emerald-50 text-emerald-600',
  'bg-indigo-50 text-indigo-600',
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
            return (
              <RevealOnScroll key={item.titleKey} delay={i * 80} className="h-full">
                <div className="pro-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  {/* Top accent bar — per-card identity colour */}
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${ACCENT_GRADIENTS[i]}`} aria-hidden="true" />
                  {/* Big progressive step number */}
                  <span className="absolute -right-2 -top-4 select-none text-7xl font-extrabold text-slate-100/15 transition-colors group-hover:text-brand-30">
                    <CountUp end={item.number} prefix="0" />
                  </span>

                  <div className="relative">
                    <IconTile icon={Icon} className="h-6 w-6" tileClassName={`${ICON_TINTS[i]} p-3`} />
                    <h3 className="mt-4 text-lg font-semibold text-ink-900">{t(item.titleKey)}</h3>
                    <p className="mt-2 text-sm text-ink-500">{t(item.descKey)}</p>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
