'use client';

import { Factory, Clock, Settings2, Globe } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import type { ComponentType } from 'react';

export default function AdvantagesSection() {
  const { t } = useLocale();
  const items: { icon: ComponentType<{ className?: string }>; titleKey: string; descKey: string }[] = [
    { icon: Factory, titleKey: 'home.advantages.factoryDirect', descKey: 'home.advantages.factoryDirectDesc' },
    { icon: Clock, titleKey: 'home.advantages.selfService', descKey: 'home.advantages.selfServiceDesc' },
    { icon: Settings2, titleKey: 'home.advantages.oem', descKey: 'home.advantages.oemDesc' },
    { icon: Globe, titleKey: 'home.advantages.globalShipping', descKey: 'home.advantages.globalShippingDesc' },
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-qtech">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink-900">{t('home.advantages.title')}</h2>
          <p className="mt-2 text-ink-500">{t('home.advantages.subtitle')}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.titleKey} className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm text-ink-500">{t(item.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
