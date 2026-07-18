'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V40): "Glass Aquarium" theme.
 * A deep-sea blue-green tank (slate-900 → cyan-950 → teal-900) seen through a
 * frosted-glass observation pod. Pure-CSS aquarium motion: soft god rays
 * piercing from the surface, a shimmering water line at the top, rising
 * bubbles from the floor and drifting bioluminescent plankton. All motion is
 * pure CSS and is part of the brand ambient set (kept running under
 * prefers-reduced-motion per V36.1).
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
  const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
    left: rand(i) * 100,
    size: 6 + rand(i + 50) * 18,
    dur: 9 + rand(i + 100) * 8,
    delay: rand(i + 150) * 10,
  }));
  const PLANKTON = Array.from({ length: 10 }, (_, i) => ({
    left: rand(i + 200) * 100,
    top: 18 + rand(i + 250) * 70,
    size: 2 + rand(i + 300) * 3,
    dur: 9 + rand(i + 350) * 7,
    dx: (rand(i + 400) - 0.5) * 36,
    delay: rand(i + 450) * 8,
  }));

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="cta-aqua relative min-h-[520px] overflow-hidden rounded-3xl shadow-lift">
        {/* Soft vertical god rays from the surface */}
        <div className="cta-godray cta-godray--1" aria-hidden="true" />
        <div className="cta-godray cta-godray--2" aria-hidden="true" />
        <div className="cta-godray cta-godray--3" aria-hidden="true" />

        {/* Shimmering water-surface line at the top of the tank */}
        <div className="cta-wave" aria-hidden="true" />

        {/* Rising bubbles from the floor */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {BUBBLES.map((b, i) => (
            <span
              key={`b-${i}`}
              className="cta-bubble"
              style={{
                left: `${b.left}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Drifting bioluminescent plankton */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {PLANKTON.map((p, i) => (
            <span
              key={`p-${i}`}
              className="cta-plankton"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--cta-dur' as any]: `${p.dur}s`,
                ['--cta-dx' as any]: `${p.dx}px`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom cyan/teal glow for depth */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[720px] max-w-[120vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.22), rgba(20,184,166,0.05) 45%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Deep-sea command pod — dark translucent glass that fills the tank
            (immersive, not a floating white card). Aquarium motion stays behind. */}
        <div className="relative z-10 flex min-h-[520px] items-center justify-center p-3 sm:p-5">
          <div className="flex w-full min-h-[440px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/55 px-6 py-12 text-center shadow-lift backdrop-blur-2xl sm:px-16 sm:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-5 py-2 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/20">
              <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
              <span className="font-semibold">
                {locale === 'zh' ? '立即开启合作'
                  : locale === 'ar' ? 'ابدأ التعاون الآن'
                  : "Let's Build Something Great"}
              </span>
            </div>

            <h2 className="mx-auto mt-7 text-4xl font-black leading-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {ctaTitle}
            </h2>

            {ctaSubtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
                {ctaSubtitle}
              </p>
            )}

            <Link
              href={`/${locale}/contact`}
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:from-cyan-400 hover:to-teal-400 active:scale-[0.97]"
            >
              {ctaButton}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.75} />
            </Link>

            {ctaProof && (
              <div className="mt-10 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <IconTile icon={CheckCircle2} className="h-4 w-4" tileClassName="bg-emerald-500/20 text-emerald-300 p-1.5" />
                  {ctaProof}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-white/80">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" strokeWidth={1.75} /> ISO &amp; CE Certified
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-white/80">
                  <Globe2 className="h-4 w-4 text-cyan-300" strokeWidth={1.75} /> 80+ Countries Served
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
