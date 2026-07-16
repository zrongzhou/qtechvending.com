'use client';

import { Factory, Clock, Settings2, Globe, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

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
    <section className="bg-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t('home.advantages.eyebrow')}</p>
          <h2 className="mt-3 text-2xl font-bold text-ink-900 md:text-3xl">{t('home.advantages.title')}</h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-brand-500" aria-hidden="true" />
          <p className="mt-4 text-ink-600">{t('home.advantages.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll key={item.titleKey} delay={i * 80} className="h-full">
                <div className="pro-card group relative flex h-full flex-col overflow-hidden rounded-2xl p-6">
                  {/* Top accent bar — visual anchor */}
                  <span className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-brand-400 to-brand-700" aria-hidden="true" />
                  {/* Big progressive step number */}
                  <span className="absolute -right-2 -top-4 select-none text-7xl font-extrabold text-slate-100/15 transition group-hover:text-brand-50">
                    <CountUp end={item.number} prefix="0" />
                  </span>

                  <div className="relative">
                    <IconTile icon={Icon} className="h-6 w-6" tileClassName="bg-brand-50 text-brand-600 p-3" />
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
