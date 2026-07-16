'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

export default function CtaSection() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-12 text-center text-white shadow-lift sm:px-16 sm:py-16">
        {/* Content layer */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white">
            <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-white/25 text-white p-1.5" />
            {locale === 'zh' ? '立即开启合作'
              : locale === 'ar' ? 'ابدأ التعاون الآن'
              : "Let's Build Something Great"}
          </div>

          <h2 className="mx-auto mt-7 max-w-3xl line-clamp-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {t('home.cta.title')}
          </h2>

          {t('home.cta.subtitle') && (
            <p className="mx-auto mt-4 line-clamp-2 max-w-xl text-base text-white/80 sm:text-lg">
              {t('home.cta.subtitle')}
            </p>
          )}

          <Link
            href={`/${locale}/contact`}
            className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            {t('home.cta.button')}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
          </Link>

          {t('home.cta.proof') && (
            <p className="mt-4 inline-flex items-center gap-1 text-sm text-white/70">
              <IconTile icon={CheckCircle2} className="h-4 w-4" tileClassName="bg-white/25 text-white p-1.5" />
              {t('home.cta.proof')}
            </p>
          )}
        </div>
      </div>
    </RevealOnScroll>
  );
}
