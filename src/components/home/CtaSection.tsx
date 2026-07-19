'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanBubbles from '@/components/ui/OceanBubbles';

/**
 * Closing call-to-action (V48.4): Pure **water / aquarium** theme.
 *
 * The user explicitly requested ONLY the original water/aquarium animation for
 * this section — NO mountains, NO sunrise beams, NO golden dust. Restored to
 * the V43/V44-era crystal-aquarium feel: OceanBubbles canvas + CSS waves +
 * god rays + frosted glass panel.
 *
 * Layered composition:
 *   0  — deep seawater background (cta-aqua gradient)
 *   1  — OceanBubbles (canvas) rising through the water
 *   2  — god rays piercing the surface
 *   3  — bottom ocean waves rolling
 *   4  — floating plankton motes
 *   5  — frosted glass overlay (.cta-sunrise__glass reused for blur)
 *   6  — centred content panel
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  const ctaTitle = t('home.cta.title');
  const ctaSubtitle = t('home.cta.subtitle');
  const ctaButton = t('home.cta.button');
  const ctaProof = t('home.cta.proof');

  // Deterministic pseudo-random so server and client renders match.
  const rand = (n: number): number => {
    const x = Math.sin(n * 53.17 + 9.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const PLANKTON = Array.from({ length: 28 }, (_, i) => ({
    left: rand(i) * 100,
    bottom: rand(i + 300) * 45,
    size: 6 + rand(i + 50) * 10,
    dur: 8 + rand(i + 100) * 12,
    delay: rand(i + 150) * 10,
    dx: (rand(i + 200) - 0.5) * 60,
  }));

  return (
    <RevealOnScroll as="section" className="relative w-full overflow-hidden rounded-none">
      <div className="cta-aqua relative min-h-[480px] w-full overflow-hidden py-16 md:py-24">

        {/* ===== LAYER 1: OceanBubbles canvas (the core water effect) ===== */}
        <OceanBubbles tone="dark" className="absolute inset-0 z-[1] pointer-events-none opacity-95" count={32} />

        {/* ===== LAYER 1b: Top-down sunlight piercing the surface ===== */}
        <div className="cta-aqua__sun absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />

        {/* ===== LAYER 1c: Central aquarium lamp highlight ===== */}
        <div className="cta-aqua__lamp absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />

        {/* ===== LAYER 2: God rays piercing the surface ===== */}
        <div className="cta-godray cta-godray--1" aria-hidden="true" />
        <div className="cta-godray cta-godray--2" aria-hidden="true" />
        <div className="cta-godray cta-godray--3" aria-hidden="true" />
        <div className="cta-godray cta-godray--4" aria-hidden="true" />

        {/* ===== LAYER 3: Top water-surface ripple line ===== */}
        <div className="cta-wave" aria-hidden="true" />

        {/* ===== LAYER 4: Bottom ocean waves ===== */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-36 overflow-hidden" aria-hidden="true">
          <div className="ocean-wave ocean-wave--1" />
          <div className="ocean-wave ocean-wave--2" />
          <div className="ocean-wave ocean-wave--3" />
        </div>

        {/* ===== LAYER 5: Floating plankton / light motes ===== */}
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
          {PLANKTON.map((p, i) => (
            <span
              key={i}
              className="cta-plankton"
              style={
                {
                  left: `${p.left}%`,
                  bottom: `${p.bottom}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  ['--cta-dur' as string]: `${p.dur}s`,
                  ['--cta-dx' as string]: `${p.dx}px`,
                  animationDelay: `${p.delay}s`,
                  ['--cta-bg' as string]: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.98), rgba(103,232,249,0.45) 50%, rgba(186,230,253,0.10) 72%, transparent 80%)',
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* ===== LAYER 6: Frosted glass overlay ===== */}
        <div className="cta-sunrise__glass" aria-hidden="true" />

        {/* ===== LAYER 7: Content ===== */}
        <div className="relative z-10 flex min-h-[480px] items-center justify-center p-4 sm:p-6">
          <div className="cta-sunrise__panel mx-auto flex w-full max-w-4xl flex-col items-center rounded-[28px] border border-white/15 bg-white/[0.07] px-6 py-12 text-center backdrop-blur-xl shadow-2xl shadow-black/30 sm:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/50 bg-white/10 px-5 py-2 text-sm font-medium text-cyan-50 ring-1 ring-white/20 backdrop-blur-sm">
              <IconTile
                icon={Sparkles}
                className="h-4 w-4"
                tileClassName="bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-1.5"
              />
              <span className="font-semibold">
                {locale === 'zh' ? '开启合作' : locale === 'ar' ? 'ابدأ التعاون' : "Let's Build Together"}
              </span>
            </div>

            <h2 className="mx-auto mt-7 text-4xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(8,145,178,0.6)] sm:text-5xl lg:text-6xl">
              {ctaTitle}
            </h2>

            {ctaSubtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-cyan-50/90 drop-shadow-[0_1px_6px_rgba(8,145,178,0.5)] sm:text-lg">
                {ctaSubtitle}
              </p>
            )}

            <Link
              href={`/${locale}/contact`}
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-cyan-400 px-8 py-3.5 text-base font-semibold text-cyan-400 transition-all duration-300 hover:bg-cyan-400 hover:text-black active:scale-[0.97]"
            >
              {ctaButton}
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                strokeWidth={1.75}
              />
            </Link>

            {ctaProof && (
              <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-cyan-200/30 pt-6 text-sm font-medium text-cyan-50/90">
                <span className="inline-flex items-center gap-1.5">
                  <IconTile
                    icon={CheckCircle2}
                    className="h-4 w-4"
                    tileClassName="bg-cyan-400/30 text-cyan-100 p-1.5"
                  />
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
