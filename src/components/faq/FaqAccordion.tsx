'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { SiteFaqCategory } from '@/types';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Tabbed FAQ: a sticky category rail on the left (lg) / horizontal pills (mobile)
 * drives which group is shown. Selected group renders as a clean accordion of
 * frosted cards. "All" shows every question in one scrollable column.
 */
/** V49.9⑥: per-category accent colours so the FAQ cards read as colour-coded
 *  groups rather than a wall of identical white cards. */
const CAT_ACCENT: Record<string, { from: string; to: string; border: string; chipBg: string; chipText: string }> = {
  general:         { from: '#22d3ee', to: '#0891b2', border: '#06b6d4', chipBg: 'bg-cyan-50',   chipText: 'text-cyan-700' },
  technical:       { from: '#38bdf8', to: '#0e7490', border: '#0ea5e9', chipBg: 'bg-sky-50',    chipText: 'text-sky-700' },
  'order-support': { from: '#2dd4bf', to: '#0f766e', border: '#0d9488', chipBg: 'bg-teal-50',  chipText: 'text-teal-700' },
};

export default function FaqAccordion({ categories = [] }: { categories?: SiteFaqCategory[] }) {
  const { t, locale } = useLocale();
  const [active, setActive] = useState<string>('all');
  const [open, setOpen] = useState<Record<string, number>>({});

  const toggle = (catId: string, idx: number) => {
    setOpen((prev) => ({ ...prev, [catId]: prev[catId] === idx ? -1 : idx }));
  };

  const tabs = [{ id: 'all', title: { en: 'All', zh: '全部', ar: 'الكل' } }, ...categories];
  const visibleCats = active === 'all' ? categories : categories.filter((c) => c.id === active);

  return (
    <RevealOnScroll className="relative bg-gradient-to-b from-slate-50 via-white to-cyan-50/30">
        <div className="container-qtech relative overflow-hidden py-20 md:py-28">
        {/* V49.8: decorative colour blooms so the page reads less flat. */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          {/* subtle brand grid for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(8,145,178,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute -top-20 start-0 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute top-1/3 end-0 h-80 w-80 rounded-full bg-teal-300/22 blur-3xl" />
          <div className="absolute bottom-0 start-1/4 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" />
          <div className="absolute top-1/2 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/12 blur-3xl" />
        </div>
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-cyan-700 shadow-sm ring-1 ring-cyan-100 backdrop-blur-sm">
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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-white/20'
                      : 'text-ink-600 ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-700 hover:ring-cyan-200'
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
          {visibleCats.map((cat) => {
            const accent = CAT_ACCENT[cat.id] ?? CAT_ACCENT.general;
            return (
            <section key={cat.id} className={active === 'all' ? 'mb-10' : ''}>
              {active === 'all' && (
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink-900">
                  <span className="h-5 w-1.5 rounded-full" style={{ background: accent.border }} />
                  {localized(cat.title, locale)}
                </h2>
              )}
              <div className="space-y-3">
                {cat.items.map((item, idx) => {
                  const isOpen = open[cat.id] === idx;
                  return (
                    <RevealOnScroll key={idx} delay={idx * 60} className="h-full">
                    <div
                      className="faq-accent-card relative overflow-hidden rounded-2xl border border-white/60 bg-white/65 shadow-[0_6px_24px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/70 hover:bg-white/80 hover:shadow-[0_16px_44px_rgba(8,145,178,0.20),0_0_22px_rgba(34,211,238,0.12)]"
                      style={{ ['--accent' as string]: accent.from, borderLeft: `4px solid ${accent.from}` } as CSSProperties}
                    >
                      <span className="absolute inset-x-0 top-0 z-20 h-1" style={{ background: `linear-gradient(to right, ${accent.from}, ${accent.to})` }} />
                      <button
                          type="button"
                          onClick={() => toggle(cat.id, idx)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
                        >
                          <span className="flex items-center gap-3 text-base font-semibold text-ink-900">
                            <IconTile icon={HelpCircle} className="h-4 w-4" tileClassName={`${accent.chipBg} ${accent.chipText} p-1.5`} />
                            {localized(item.question, locale)}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-cyan-700 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-ink-600">
                              {localized(item.answer, locale)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </section>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-teal-700 px-8 py-14 text-center text-white shadow-lift">
          {/* decorative glow orbs + sheen (brand ambient) */}
          <div className="pointer-events-none absolute -top-16 -start-10 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -end-12 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" aria-hidden="true" />
          <div className="cta-sheen pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
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
