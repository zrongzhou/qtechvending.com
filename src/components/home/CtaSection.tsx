'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';

export default function CtaSection() {
  const { t, locale } = useLocale();

  return (
    <section className="container-qtech py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl">{t('home.cta.title')}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{t('home.cta.subtitle')}</p>
        <Link
          href={`/${locale}/contact`}
          className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow transition hover:bg-brand-50"
        >
          {t('home.cta.button')}
        </Link>
      </div>
    </section>
  );
}
