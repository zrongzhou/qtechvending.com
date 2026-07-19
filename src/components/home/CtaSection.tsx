'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V48.1, R2): "日照金山 / Golden Mountain at Sunrise".
 *
 * Layered composition, back-to-front:
 *   0  — sunrise scene: sky gradient + multi-layer mountain ridges (far misty
 *        violet → near deep-indigo with a gold sunrise rim) + a 45° light beam
 *        sweeping from the top-right + golden dust motes drifting up.
 *   1  — frosted glass overlay (.cta-sunrise__glass) so the band keeps the
 *        premium "glass aquarium" feel the user loved, while the vivid scene
 *        still glows through.
 *   2  — centred content: title / subtitle / gold-bordered button / trust row.
 *
 * All motion is pure CSS (see globals.css `.cta-sunrise*`) and is disabled
 * under prefers-reduced-motion. Copy is trilingual via i18n.
 */
export default function CtaSection() {
  const { t, locale } = useLocale();

  const ctaTitle = t('home.cta.title');
  const ctaSubtitle = t('home.cta.subtitle');
  const ctaButton = t('home.cta.button');
  const ctaProof = t('home.cta.proof');

  // Deterministic pseudo-random so server and client renders match (no
  // hydration mismatch). Each mote gets a stable position/size/speed.
  const rand = (n: number): number => {
    const x = Math.sin(n * 53.17 + 9.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const DUST = Array.from({ length: 30 }, (_, i) => ({
    left: rand(i) * 100,
    bottom: rand(i + 300) * 35,
    size: 2 + rand(i + 50) * 5, // 2px ~ 7px
    dur: 7 + rand(i + 100) * 9, // 7s ~ 16s
    delay: rand(i + 150) * 9,
    dx: (rand(i + 200) - 0.5) * 70,
  }));

  return (
    <RevealOnScroll as="section" className="relative w-full overflow-hidden rounded-none">
      <div className="cta-sunrise relative min-h-[480px] w-full overflow-hidden py-16 md:py-24">
        {/* Warm sky glow pooling at the top. */}
        <div className="cta-sunrise__sky" aria-hidden="true" />
        {/* Sweeping light beam from the top-right (45°). */}
        <div className="cta-sunrise__beam" aria-hidden="true" />
        {/* Second, counter-sweeping beam so the sunrise light reads richer (R2). */}
        <div className="cta-sunrise__beam cta-sunrise__beam--2" aria-hidden="true" />

        {/* Multi-layer mountain silhouette (SVG) — far misty ridges in back,
            near dark indigo peaks in front, each lit with a gold sunrise rim. */}
        <svg
          className="cta-sunrise__mountain"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Far ridge — misty violet/blue, softest. */}
          <path
            d="M0,320 L0,150 L200,95 L400,140 L600,80 L800,135 L1000,75 L1200,140 L1440,100 L1440,320 Z"
            fill="url(#ctaFar)"
          />
          {/* Mid ridge — indigo, a touch darker. */}
          <path
            d="M0,320 L0,205 L250,155 L450,195 L650,135 L850,185 L1050,125 L1250,185 L1440,155 L1440,320 Z"
            fill="url(#ctaMid)"
          />
          {/* Near ridge — deep indigo, with a sunlit gold rim along the tops. */}
          <path
            d="M0,320 L0,255 L300,205 L500,245 L700,185 L900,235 L1100,195 L1300,245 L1440,215 L1440,320 Z"
            fill="url(#ctaNear)"
          />
          <path
            d="M0,255 L300,205 L500,245 L700,185 L900,235 L1100,195 L1300,245 L1440,215"
            fill="none"
            stroke="rgba(253,224,138,0.7)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="ctaFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="ctaMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3730a3" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="ctaNear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#312e81" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Golden dust motes drifting upward (above the glass layer). */}
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
          {DUST.map((d, i) => (
            <span
              key={i}
              className="cta-sunrise__dust"
              style={
                {
                  left: `${d.left}%`,
                  bottom: `${d.bottom}%`,
                  width: `${d.size}px`,
                  height: `${d.size}px`,
                  ['--sd-dur' as string]: `${d.dur}s`,
                  ['--sd-dx' as string]: `${d.dx}px`,
                  animationDelay: `${d.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Frosted glass overlay — the "glass aquarium" layer. */}
        <div className="cta-sunrise__glass" aria-hidden="true" />

        {/* Content — sits above the glass, centred in a frosted panel. */}
        <div className="relative z-10 flex min-h-[480px] items-center justify-center p-4 sm:p-6">
          <div className="cta-sunrise__panel mx-auto flex w-full max-w-4xl flex-col items-center rounded-[28px] border border-white/15 bg-white/[0.07] px-6 py-12 text-center backdrop-blur-xl shadow-2xl shadow-black/30 sm:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-white/10 px-5 py-2 text-sm font-medium text-amber-50 ring-1 ring-white/20 backdrop-blur-sm">
              <IconTile
                icon={Sparkles}
                className="h-4 w-4"
                tileClassName="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-1.5"
              />
              <span className="font-semibold">
                {locale === 'zh' ? '开启合作' : locale === 'ar' ? 'ابدأ التعاون' : "Let's Build Together"}
              </span>
            </div>

            <h2 className="mx-auto mt-7 text-4xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(76,29,149,0.6)] sm:text-5xl lg:text-6xl">
              {ctaTitle}
            </h2>

            {ctaSubtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-amber-50/90 drop-shadow-[0_1px_6px_rgba(76,29,149,0.5)] sm:text-lg">
                {ctaSubtitle}
              </p>
            )}

            <Link
              href={`/${locale}/contact`}
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-amber-400 px-8 py-3.5 text-base font-semibold text-amber-400 transition-all duration-300 hover:bg-amber-400 hover:text-black active:scale-[0.97]"
            >
              {ctaButton}
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                strokeWidth={1.75}
              />
            </Link>

            {ctaProof && (
              <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-amber-200/30 pt-6 text-sm font-medium text-amber-50/90">
                <span className="inline-flex items-center gap-1.5">
                  <IconTile
                    icon={CheckCircle2}
                    className="h-4 w-4"
                    tileClassName="bg-amber-400/30 text-amber-100 p-1.5"
                  />
                  {ctaProof}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-200" strokeWidth={1.75} /> ISO &amp; CE Certified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-amber-200" strokeWidth={1.75} /> 80+ Countries Served
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </RevealOnScroll>
  );
}
