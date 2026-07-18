'use client';

import { Check } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localizedList } from '@/lib/localize';
import IconTile from '@/components/ui/IconTile';
import type { I18nStringList } from '@/types';

/**
 * Renders the product's feature highlights (no separate FAQ model in v1).
 * `features` is shaped as { en: [], zh: [], ar: [] }.
 */
export default function ProductFaqSection({ features }: { features: I18nStringList | null }) {
  const { t, locale } = useLocale();
  const items = localizedList(features, locale);
  if (!items.length) return null;

  return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-6 backdrop-blur-xl shadow-lift">
        <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-cyan-400 to-teal-400" />
        <h2 className="text-lg font-semibold text-white">{t('product.features')}</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
              <IconTile icon={Check} className="h-5 w-5 shrink-0" tileClassName="bg-cyan-500/90 text-white" />
              {item}
            </li>
          ))}
        </ul>
      </div>
  );
}
