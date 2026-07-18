'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V36): a quiet night village.
 * Deep indigo/slate sky, a crescent moon, a village silhouette with glowing
 * windows, drifting stars and fireflies, and a frosted glass panel for the copy.
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  const ctaTitle = t('home.cta.title');
  const ctaSubtitle = t('home.cta.subtitle');
  const ctaButton = t('home.cta.button');
  const ctaProof = t('home.cta.proof');

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="relative min-h-[460px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 shadow-lift">
        {/* Stars — sparse, CSS-only twinkling dots */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {[...Array(18)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white village-star"
              style={{
                top: `${6 + Math.random() * 54}%`,
                left: `${4 + Math.random() * 92}%`,
                opacity: 0.25 + Math.random() * 0.55,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2.5 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Crescent moon — top right */}
        <div className="pointer-events-none absolute end-6 top-6 sm:end-10 sm:top-10" aria-hidden="true">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            className="moon-glow drop-shadow-[0_0_18px_rgba(254,243,199,0.45)]"
          >
            <path
              d="M58 58c0-18.778-15.222-34-34-34-.83 0-1.65.03-2.46.09C27.16 12.23 40.61 2 56.5 2 65.06 2 72 8.94 72 17.5 72 40.03 53.03 59 30.5 59c-1.06 0-2.1-.05-3.13-.15C28.16 64.83 34.4 69 41.5 69c9.11 0 16.5-7.39 16.5-16.5V58Z"
              fill="#FEF3C7"
            />
          </svg>
        </div>

        {/* Fireflies — small yellow-green glow dots drifting slowly */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="firefly absolute h-1.5 w-1.5 rounded-full bg-yellow-200 shadow-[0_0_6px_2px_rgba(253,224,71,0.6)]"
              style={{
                top: `${45 + Math.random() * 40}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 8}s`,
              }}
            />
          ))}
        </div>

        {/* Village silhouette — hills and houses */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
          <svg
            viewBox="0 0 1200 140"
            preserveAspectRatio="xMidYMax slice"
            className="h-auto w-full min-w-[800px]"
          >
            {/* Back hills */}
            <path
              d="M0 140 L0 70 C180 40 320 90 500 60 C680 30 820 70 1000 55 C1100 45 1160 60 1200 50 L1200 140 Z"
              fill="rgba(15,23,42,0.85)"
            />
            {/* Foreground hill + village ground */}
            <path
              d="M0 140 L0 100 C220 75 380 115 600 95 C780 78 920 108 1100 90 C1150 86 1180 95 1200 92 L1200 140 Z"
              fill="rgba(2,6,23,0.95)"
            />
            {/* House 1 */}
            <rect x="160" y="73" width="34" height="28" fill="rgba(15,23,42,0.98)" />
            <path d="M153 73 L177 55 L201 73 Z" fill="rgba(15,23,42,0.98)" />
            <rect x="167" y="80" width="8" height="8" fill="rgba(251,191,36,0.35)" className="window-glow" />
            <rect x="179" y="80" width="8" height="8" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '0.5s' }} />
            {/* House 2 */}
            <rect x="220" y="66" width="42" height="35" fill="rgba(15,23,42,0.98)" />
            <path d="M212 66 L241 48 L270 66 Z" fill="rgba(15,23,42,0.98)" />
            <rect x="228" y="74" width="10" height="10" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '1.2s' }} />
            <rect x="244" y="74" width="10" height="10" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '2.1s' }} />
            <rect x="236" y="88" width="10" height="10" fill="rgba(251,191,36,0.32)" className="window-glow" style={{ animationDelay: '0.8s' }} />
            {/* House 3 (tall narrow) */}
            <rect x="780" y="58" width="26" height="43" fill="rgba(15,23,42,0.98)" />
            <path d="M775 58 L793 45 L811 58 Z" fill="rgba(15,23,42,0.98)" />
            <rect x="786" y="65" width="7" height="7" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '1.5s' }} />
            <rect x="786" y="78" width="7" height="7" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '2.8s' }} />
            <rect x="786" y="91" width="7" height="7" fill="rgba(251,191,36,0.3)" className="window-glow" style={{ animationDelay: '0.3s' }} />
            {/* House 4 */}
            <rect x="850" y="72" width="38" height="29" fill="rgba(15,23,42,0.98)" />
            <path d="M843 72 L869 56 L895 72 Z" fill="rgba(15,23,42,0.98)" />
            <rect x="858" y="79" width="9" height="9" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '1.8s' }} />
            <rect x="873" y="79" width="9" height="9" fill="rgba(251,191,36,0.35)" className="window-glow" style={{ animationDelay: '0.6s' }} />
            {/* Small tree silhouettes */}
            <circle cx="130" cy="95" r="10" fill="rgba(2,6,23,0.9)" />
            <circle cx="145" cy="98" r="7" fill="rgba(2,6,23,0.9)" />
            <circle cx="920" cy="94" r="9" fill="rgba(2,6,23,0.9)" />
            <circle cx="935" cy="97" r="6" fill="rgba(2,6,23,0.9)" />
          </svg>
        </div>

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
