'use client';

import { useLocale } from '@/lib/i18n';
import { localizedList } from '@/lib/localize';
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
    <div className="pro-card p-6">
      <h2 className="text-lg font-semibold text-ink-900">{t('product.features')}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
