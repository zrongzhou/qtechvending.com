'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { FaqItem } from '@/types';

/**
 * Renders the product FAQ as an accessible accordion (V49.15).
 * Each item is { q: I18nText, a: I18nText } so the answer follows the locale.
 */
export default function ProductFaqAccordion({ faq }: { faq: FaqItem[] | null }) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState<number | null>(faq && faq.length ? 0 : null);

  if (!faq || faq.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl shadow-soft">
      <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-cyan-400 to-teal-400" />
      <h2 className="text-lg font-semibold text-ink-900">{t('product.faq')}</h2>
      <div className="mt-2 divide-y divide-slate-200">
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm font-medium text-ink-800">{localized(item.q, locale)}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <p className="pb-4 text-sm leading-relaxed text-ink-600">{localized(item.a, locale)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
