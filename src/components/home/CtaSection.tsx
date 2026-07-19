'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

/**
 * Closing call-to-action (V48, R8): "日照金山 / Golden Mountain at Sunrise".
 *
 * A full-bleed dramatic scene: a pale warm sky glows at the top, a band of
 * gold/orange sunlight lights the mountain ridges in the middle, and a deep
 * indigo/plum mountain silhouette anchors the bottom. A slow light beam sweeps
 * from the top-right, golden dust motes drift upward, and an SVG mountain range
 * gives the scene a real silhouette. The content floats on the scene in white /
 * gold. All motion is pure CSS (see globals.css `.cta-sunrise*`) and is disabled
 * under prefers-reduced-motion.
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
    bottom: rand(i + 300) * 30,
    size: 2 + rand(i + 50) * 5, // 2px ~ 7px
    dur: 7 + rand(i + 100) * 9, // 7s ~ 16s
    delay: rand(i + 150) * 9,
    dx: (rand(i + 200) - 0.5) * 60,
  }));

  return (
    // Full-bleed so the golden-mountain scene spans the whole viewport width.
    <RevealOnScroll as="section" className="relative w-full">
      <div className="cta-sunrise relative min-h-[560px] w-full overflow-hidden py-20 md:py-28">
        {/* Warm sky glow pooling at the top. */}
        <div className="cta-sunrise__sky" aria-hidden="true" />
        {/* Sweeping light beam from the top-right. */}
        <div className="cta-sunrise__beam" aria-hidden="true" />

        {/* Mountain silhouette (SVG) pinned to the base. */}
        <svg
          className="cta-sunrise__mountain"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,320 L0,210 L160,120 L300,200 L470,90 L640,190 L820,70 L1000,180 L1180,110 L1320,200 L1440,140 L1440,320 Z"
            fill="#1e1b4b"
          />
          <path
            d="M0,210 L160,120 L300,200 L470,90 L640,190 L820,70 L1000,180 L1180,110 L1320,200 L1440,140"
            fill="none"
            stroke="rgba(253,230,138,0.55)"
            strokeWidth="2"
          />
        </svg>

        {/* Golden dust motes. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
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

        {/* Content */}
        <div className="relative z-10 flex min-h-[560px] items-center justify-center p-3 sm:p-5">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
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
              className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-amber-300/80 px-8 py-3.5 text-base font-semibold text-amber-50 transition-colors duration-300 hover:bg-amber-400/90 hover:text-amber-950 active:scale-[0.97]"
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
