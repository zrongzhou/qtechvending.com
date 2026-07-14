'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';

export default function CtaSection() {
  const { t, locale } = useLocale();

  return (
    <section className="container-qtech py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white animate-gradient-x">
        <h2 className="text-3xl font-bold sm:text-4xl">{t('home.cta.title')}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{t('home.cta.subtitle')}</p>
        <Link
          href={`/${locale}/contact`}
          className="mt-8 inline-flex rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-50"
        >
          {t('home.cta.button')}
        </Link>
        {t('home.cta.proof') && (
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            <span aria-hidden="true">★</span>
            {t('home.cta.proof')}
          </p>
        )}
      </div>
    </section>
  );
}
