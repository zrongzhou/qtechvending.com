'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import AuroraBackground from '@/components/ui/AuroraBackground';

/**
 * Closing call-to-action (V30 Ocean): an AuroraBackground sits behind a
 * frosted glass panel so the band feels alive but stays readable. Content and
 * copy are unchanged; only the visual treatment is upgraded.
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900/60 via-ocean-800/40 to-ink-900/60 shadow-lift">
        {/* Ambient aurora layer — sits above the container base colour (z-0)
            and below the glass panel (z-10) so the flowing light is visible. */}
        <AuroraBackground className="absolute inset-0 z-0" />

        {/* Frosted glass content panel — almost fully transparent with a light
            blur so the colourful aurora behind remains clearly visible. */}
        <div className="relative z-10 rounded-3xl bg-white/[0.03] px-8 py-12 text-center text-white backdrop-blur-sm sm:px-16 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium text-white">
            <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-white/20 text-white p-1.5" />
            {locale === 'zh' ? '立即开启合作'
              : locale === 'ar' ? 'ابدأ التعاون الآن'
              : "Let's Build Something Great"}
          </div>

          <h2 className="mx-auto mt-7 line-clamp-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {t('home.cta.title')}
          </h2>

          {t('home.cta.subtitle') && (
            <p className="mx-auto mt-4 line-clamp-2 max-w-xl text-base text-white/80 sm:text-lg">
              {t('home.cta.subtitle')}
            </p>
          )}

          <Link
            href={`/${locale}/contact`}
            className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-ocean-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            {t('home.cta.button')}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.75} />
          </Link>

          {t('home.cta.proof') && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-1">
                <IconTile icon={CheckCircle2} className="h-4 w-4" tileClassName="bg-cyan-400/25 text-cyan-200 p-1.5" />
                {t('home.cta.proof')}
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="inline-flex items-center gap-0.5 font-medium text-white/90">
                ISO &amp; CE Certified
              </span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="inline-flex items-center gap-0.5 font-medium text-white/90">
                80+ Countries Served
              </span>
            </div>
          )}
        </div>
      </div>
    </RevealOnScroll>
  );
}
