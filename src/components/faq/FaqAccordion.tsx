'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { FAQ_CATEGORIES } from '@/lib/faq-data';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Tabbed FAQ: a sticky category rail on the left (lg) / horizontal pills (mobile)
 * drives which group is shown. Selected group renders as a clean accordion of
 * frosted cards. "All" shows every question in one scrollable column.
 */
export default function FaqAccordion() {
  const { t, locale } = useLocale();
  const [active, setActive] = useState<string>('all');
  const [open, setOpen] = useState<Record<string, number>>({});

  const toggle = (catId: string, idx: number) => {
    setOpen((prev) => ({ ...prev, [catId]: prev[catId] === idx ? -1 : idx }));
  };

  const tabs = [{ id: 'all', title: { en: 'All', zh: '全部', ar: 'الكل' } }, ...FAQ_CATEGORIES];
  const visibleCats = active === 'all' ? FAQ_CATEGORIES : FAQ_CATEGORIES.filter((c) => c.id === active);

  return (
    <RevealOnScroll className="bg-brand-50">
      <div className="container-qtech py-20 md:py-28">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <IconTile icon={HelpCircle} className="h-4 w-4" tileClassName="" />
            {t('faq.badge')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900">{t('faq.title')}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">{t('faq.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="sticky top-16 z-20 mt-10 flex justify-center">
          <div className="flex max-w-full gap-2 overflow-x-auto rounded-full border border-slate-200 bg-white/80 p-1.5 backdrop-blur no-scrollbar">
            {tabs.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActive(tab.id);
                    setOpen({});
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-ink-600 hover:bg-brand-50'
                  }`}
                >
                  {localized(tab.title, locale)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions */}
        <div className="mx-auto mt-10 max-w-3xl">
          {visibleCats.map((cat) => (
            <section key={cat.id} className={active === 'all' ? 'mb-10' : ''}>
              {active === 'all' && (
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
                  <span className="h-5 w-1.5 rounded-full bg-brand-500" />
                  {localized(cat.title, locale)}
                </h2>
              )}
              <div className="space-y-3">
                {cat.items.map((item, idx) => {
                  const isOpen = open[cat.id] === idx;
                  return (
                    <RevealOnScroll key={idx} delay={idx * 60} className="h-full">
                    <div
                      className="pro-card relative overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                    >
                      <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
                      <button
                          type="button"
                          onClick={() => toggle(cat.id, idx)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                        >
                          <span className="flex items-center gap-3 text-base font-semibold text-ink-900">
                            <IconTile icon={HelpCircle} className="h-4 w-4" tileClassName="bg-brand-50 text-brand-600 p-1.5" />
                            {localized(item.question, locale)}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-ink-600">
                            {localized(item.answer, locale)}
                          </div>
                        )}
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white shadow-xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('faq.ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/90">{t('faq.ctaSubtitle')}</p>
            <Link
              href={`/${locale}/contact`}
              className="btn-primary group mt-8 px-9 py-4 text-base"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              {t('faq.ctaButton')}
            </Link>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
