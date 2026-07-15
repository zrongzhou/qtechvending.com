'use client';

import { Factory, Clock, Settings2, Globe } from 'lucide-react';
import { type ComponentType } from 'react';
import { useLocale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';

export default function AdvantagesSection() {
  const { t } = useLocale();
  const items: {
    number: number;
    icon: ComponentType<{ className?: string }>;
    titleKey: string;
    descKey: string;
  }[] = [
    { number: 1, icon: Factory, titleKey: 'home.advantages.factoryDirect', descKey: 'home.advantages.factoryDirectDesc' },
    { number: 2, icon: Clock, titleKey: 'home.advantages.selfService', descKey: 'home.advantages.selfServiceDesc' },
    { number: 3, icon: Settings2, titleKey: 'home.advantages.oem', descKey: 'home.advantages.oemDesc' },
    { number: 4, icon: Globe, titleKey: 'home.advantages.globalShipping', descKey: 'home.advantages.globalShippingDesc' },
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-qtech">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink-900">{t('home.advantages.title')}</h2>
          <span className="mt-3 block h-1 w-16 rounded-full bg-brand-500" aria-hidden="true" />
          <p className="mt-2 text-ink-500">{t('home.advantages.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="pro-card group relative overflow-hidden rounded-2xl p-6"
              >
                {/* Big progressive step number */}
                <span className="absolute -right-2 -top-4 select-none text-7xl font-extrabold text-slate-100 transition group-hover:text-brand-50">
                  <CountUp end={item.number} prefix="0" />
                </span>

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">{t(item.titleKey)}</h3>
                  <p className="mt-2 text-sm text-ink-500">{t(item.descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
