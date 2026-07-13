'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';

export interface AboutSection {
  key: string;
  title: Record<string, string>;
  body: Record<string, string>;
  image?: string;
}

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  return (
    <div>
      <section className="bg-brand-gradient text-white">
        <div className="container-qtech py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t('about.title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{t('about.subtitle')}</p>
        </div>
      </section>

      <div className="container-qtech space-y-16 py-16 lg:py-20">
        {sections.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          return (
            <section
              key={section.key}
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
                <div className="prose-qtech mt-4">
                  {body
                    .split(/\n{2,}/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-ink-600">
                        {p}
                      </p>
                    ))}
                </div>
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.image || '/images/og-default.svg'}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
                  }}
                />
              </div>
            </section>
          );
        })}

        <section className="rounded-3xl bg-ink-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">{t('about.cta')}</h2>
          <Link
            href={`/${locale}/contact`}
            className="mt-6 inline-flex rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            {t('nav.getQuote')}
          </Link>
        </section>
      </div>
    </div>
  );
}
