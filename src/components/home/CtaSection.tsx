'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import AuroraBackground from '@/components/ui/AuroraBackground';

/**
 * Closing call-to-action (V38): deep-space aurora scene.
 * Replaces the previous quiet night village with a cosmic aurora gradient,
 * a few faint stars and a subtle bottom glow, while keeping the frosted-glass
 * content panel and primary button unchanged.
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  const ctaTitle = t('home.cta.title');
  const ctaSubtitle = t('home.cta.subtitle');
  const ctaButton = t('home.cta.button');
  const ctaProof = t('home.cta.proof');

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="relative min-h-[460px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900 shadow-lift">
        {/* Aurora ribbons — always animating (brand ambient always runs). */}
        <AuroraBackground className="absolute inset-0" reduced={false} />

        {/* Faint star layer — reduced to 8–10 sparse dots. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                top: `${6 + Math.random() * 52}%`,
                left: `${4 + Math.random() * 92}%`,
                opacity: 0.2 + Math.random() * 0.45,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2.5 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom-centered brand-cyan/teal glow for depth. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-500/10 via-teal-500/5 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gradient-radial from-cyan-400/20 via-teal-400/10 to-transparent blur-3xl"
          aria-hidden="true"
        />

        {/* Frosted glass content panel */}
        <div className="relative z-10 flex min-h-[460px] items-center justify-center px-6 py-12 sm:px-16 sm:py-16">
          <div className="max-w-2xl rounded-2xl bg-white/[0.06] px-8 py-10 text-center text-white backdrop-blur-xl ring-1 ring-white/10 sm:px-12 sm:py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/10">
              <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-white/20 text-white p-1.5" />
              {locale === 'zh' ? '立即开启合作'
                : locale === 'ar' ? 'ابدأ التعاون الآن'
                : "Let's Build Something Great"}
            </div>

            <h2 className="mx-auto mt-7 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {ctaTitle}
            </h2>

            {ctaSubtitle && (
              <p className="mx-auto mt-4 line-clamp-2 max-w-xl text-base text-white/80 sm:text-lg">
                {ctaSubtitle}
              </p>
            )}

            <Link
              href={`/${locale}/contact`}
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:from-amber-400 hover:to-orange-500 active:scale-[0.97]"
            >
              {ctaButton}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.75} />
            </Link>

            {ctaProof && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                <span className="inline-flex items-center gap-1">
                  <IconTile icon={CheckCircle2} className="h-4 w-4" tileClassName="bg-amber-400/25 text-amber-200 p-1.5" />
                  {ctaProof}
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
      </div>
    </RevealOnScroll>
  );
}
