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
      <div className="pro-card relative overflow-hidden p-6">
        <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
        <h2 className="text-lg font-semibold text-ink-900">{t('product.features')}</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-ink-600">
              <IconTile icon={Check} className="h-5 w-5 shrink-0" tileClassName="bg-brand-600 text-white" />
              {item}
            </li>
          ))}
        </ul>
      </div>
  );
}
