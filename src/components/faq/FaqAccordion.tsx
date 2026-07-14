'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { FAQ_CATEGORIES } from '@/lib/faq-data';

/**
 * Accordion FAQ page. One item per category can be expanded at a time; the
 * open index is tracked per category so each group behaves independently.
 * Glass cards provide the consistent frosted surface used across the site.
 */
export default function FaqAccordion() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState<Record<string, number>>({});

  const toggle = (catId: string, idx: number) => {
    setOpen((prev) => ({ ...prev, [catId]: prev[catId] === idx ? -1 : idx }));
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
      <div className="container-qtech py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            {t('faq.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold text-ink-900">{t('faq.title')}</h1>
          <p className="mt-4 text-lg text-ink-500">{t('faq.subtitle')}</p>
        </div>

        <div className="mt-12 space-y-12">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-xl font-bold text-ink-900">{localized(cat.title, locale)}</h2>
              <div className="mt-4 space-y-3">
                {cat.items.map((item, idx) => {
                  const isOpen = open[cat.id] === idx;
                  return (
                    <div key={idx} className="glass-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggle(cat.id, idx)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                      >
                        <span className="text-base font-semibold text-ink-900">
                          {localized(item.question, locale)}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-sm leading-relaxed text-ink-600">
                          {localized(item.answer, locale)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('faq.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/90">{t('faq.ctaSubtitle')}</p>
          <Link
            href={`/${locale}/contact`}
            className="mt-8 inline-flex rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            {t('faq.ctaButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
