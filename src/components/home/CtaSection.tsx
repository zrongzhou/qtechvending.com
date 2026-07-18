'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V43): "Crystal Aquarium" theme.
 *
 * A translucent, mid-tone seawater tank (cyan-900/80 → teal-800/70 →
 * cyan-900/80) lit from above — not a dark glass panel. Pure-CSS aquarium
 * motion: bright god rays piercing from the surface, a shimmering water line
 * at the top, rising crystalline bubbles from the floor and drifting bright
 * plankton. Content floats on a light frosted-glass panel so the scene stays
 * readable on any background. All motion is pure CSS and is part of the brand
 * ambient set (kept running under prefers-reduced-motion per V36.1).
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

  // Bubble body gradients — white / cool cyan / soft pink mix for variety.
  const BUBBLE_BG = [
    'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.98), rgba(186,230,253,0.45) 50%, rgba(186,230,253,0.10) 72%, transparent 80%)',
    'radial-gradient(circle at 32% 28%, rgba(165,243,252,0.95), rgba(103,232,249,0.40) 50%, rgba(34,211,238,0.12) 72%, transparent 80%)',
    'radial-gradient(circle at 32% 28%, rgba(255,210,225,0.90), rgba(255,180,200,0.35) 50%, rgba(255,180,200,0.08) 72%, transparent 80%)',
  ];
  const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
    left: rand(i) * 100,
    size: 3 + rand(i + 50) * 27, // 3px ~ 30px
    dur: 8 + rand(i + 100) * 7, // 8s ~ 15s (slow, "in water")
    delay: rand(i + 150) * 9,
    bg: BUBBLE_BG[i % BUBBLE_BG.length],
  }));

  // Plankton colours — bright cyan-300 / teal-200 / white.
  const PLANKTON_BG = [
    'radial-gradient(circle, rgba(103,232,249,0.95), rgba(103,232,249,0.4) 45%, transparent 75%)',
    'radial-gradient(circle, rgba(153,246,228,0.9), rgba(153,246,228,0.35) 45%, transparent 75%)',
    'radial-gradient(circle, rgba(255,255,255,0.95), rgba(224,242,254,0.4) 45%, transparent 75%)',
  ];
  const PLANKTON = Array.from({ length: 26 }, (_, i) => ({
    left: rand(i + 200) * 100,
    top: 12 + rand(i + 250) * 76,
    size: 2 + rand(i + 300) * 6, // 2px ~ 8px
    dur: 8 + rand(i + 350) * 8, // 8s ~ 16s
    dx: (rand(i + 400) - 0.5) * 44,
    delay: rand(i + 450) * 8,
    bg: PLANKTON_BG[i % PLANKTON_BG.length],
  }));

  return (
    <RevealOnScroll as="section" className="container-qtech py-20 md:py-28">
      <div className="cta-aqua relative min-h-[560px] overflow-hidden rounded-3xl shadow-lift">
        {/* Sunlight from the surface + central aquarium lamp highlight. */}
        <div className="cta-aqua__sun" aria-hidden="true" />
        <div className="cta-aqua__lamp" aria-hidden="true" />

        {/* Bright vertical god rays from the surface (4 visible beams). */}
        <div className="cta-godray cta-godray--1" aria-hidden="true" />
        <div className="cta-godray cta-godray--2" aria-hidden="true" />
        <div className="cta-godray cta-godray--3" aria-hidden="true" />
        <div className="cta-godray cta-godray--4" aria-hidden="true" />

        {/* Shimmering water-surface ripple line at the top of the tank. */}
        <div className="cta-wave" aria-hidden="true" />

        {/* Rising crystalline bubbles from the floor. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {BUBBLES.map((b, i) => (
            <span
              key={`b-${i}`}
              className="cta-bubble"
              style={{
                left: `${b.left}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                ['--cta-dur' as any]: `${b.dur}s`,
                ['--cta-bg' as any]: b.bg,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Drifting bright plankton. */}
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
                background: p.bg,
                ['--cta-dur' as any]: `${p.dur}s`,
                ['--cta-dx' as any]: `${p.dx}px`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom cyan/teal glow for depth. */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-[720px] max-w-[120vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.28), rgba(20,184,166,0.06) 45%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Light frosted-glass command pod — text floats on a translucent white
            panel so the aquarium stays visible behind it. */}
        <div className="relative z-10 flex min-h-[560px] items-center justify-center p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-4xl min-h-[460px] flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 px-6 py-12 text-center shadow-lift backdrop-blur-xl sm:px-16 sm:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/30">
              <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-400 to-teal-400 text-white p-1.5" />
              <span className="font-semibold">
                {locale === 'zh' ? '立即开启合作'
                  : locale === 'ar' ? 'ابدأ التعاون الآن'
                  : "Let's Build Something Great"}
              </span>
            </div>

            <h2 className="mx-auto mt-7 text-4xl font-black leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
              {ctaTitle}
            </h2>

            {ctaSubtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:text-lg">
                {ctaSubtitle}
              </p>
            )}

            <Link
              href={`/${locale}/contact`}
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/50 transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-teal-300 active:scale-[0.97]"
            >
              {ctaButton}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={1.75} />
            </Link>

            {ctaProof && (
              <div className="mt-10 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-sm font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                <span className="inline-flex items-center gap-1.5">
                  <IconTile icon={CheckCircle2} className="h-4 w-4" tileClassName="bg-emerald-400/30 text-emerald-100 p-1.5" />
                  {ctaProof}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" strokeWidth={1.75} /> ISO &amp; CE Certified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-cyan-200" strokeWidth={1.75} /> 80+ Countries Served
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
