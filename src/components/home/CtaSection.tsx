'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V39): "Cosmic Portal" theme.
 * A high-end, fully CSS-driven sci-fi scene — a pulsing + slowly-rotating
 * energy ring, a rising particle stream, a perspective grid floor and a
 * bottom cyan glow — wrapped around the familiar frosted-glass content panel
 * (now with a cyan ring + gradient-text badge). All motion is pure CSS and is
 * disabled under prefers-reduced-motion.
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  const ctaTitle = t('home.cta.title');
  const ctaSubtitle = t('home.cta.subtitle');
  const ctaButton = t('home.cta.button');
  const ctaProof = t('home.cta.proof');

  // Deterministic pseudo-random so server and client renders match (no
  // hydration mismatch). Each particle gets a stable position/size/speed.
  const rand = (n: number): number => {
    const x = Math.sin(n * 99.13 + 7.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const PARTICLES = 18;
  const particles = Array.from({ length: PARTICLES }, (_, i) => ({
    left: rand(i) * 100,
    size: 2 + rand(i + 100) * 4,
    dur: 6 + rand(i + 200) * 8,
    delay: rand(i + 300) * 8,
    // cyan / teal / white rotation
    color: i % 3 === 0 ? 'rgba(34,211,238,0.85)' : i % 3 === 1 ? 'rgba(45,212,191,0.85)' : 'rgba(255,255,255,0.85)',
  }));

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="relative min-h-[520px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 shadow-lift">
        {/* Energy ring(s) — pulsing + slowly rotating (pure CSS). */}
        <div className="portal-ring" aria-hidden="true" />
        <div className="portal-ring portal-ring--2" aria-hidden="true" />

        {/* Perspective grid floor (sci-fi ground). */}
        <div className="portal-grid" aria-hidden="true" />

        {/* Rising particle stream. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {particles.map((p, i) => (
            <span
              key={i}
              className="portal-particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom-center cyan glow for depth. */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[720px] max-w-[120vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.22), rgba(34,211,238,0.05) 45%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Frosted glass content panel */}
        <div className="relative z-10 flex min-h-[520px] items-center justify-center px-6 py-12 sm:px-16 sm:py-16">
          <div className="max-w-2xl rounded-2xl bg-white/[0.06] px-8 py-10 text-center text-white ring-1 ring-cyan-400/20 backdrop-blur-xl sm:px-12 sm:py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium ring-1 ring-white/10">
              <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-cyan-400/30 text-cyan-200 p-1.5" />
              <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text font-semibold text-transparent">
                {locale === 'zh' ? '立即开启合作'
                  : locale === 'ar' ? 'ابدأ التعاون الآن'
                  : "Let's Build Something Great"}
              </span>
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
