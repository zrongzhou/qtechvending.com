'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

/* ── Sunspots (slow breathing light pools) ── */
const SUNSPOTS = [
  { size: 180, left: 10, top: 18, duration: 7, delay: 0 },
  { size: 140, left: 72, top: 30, duration: 9, delay: 2 },
  { size: 120, left: 40, top: 58, duration: 8, delay: 4 },
  { size: 100, left: 85, top: 64, duration: 10, delay: 1 },
];

/* ── Static shells / sand grains (decorative) ── */
const SHELLS = [
  { size: 10, left: 12, top: 80 },
  { size: 7, left: 30, top: 88 },
  { size: 12, left: 62, top: 82 },
  { size: 6, left: 80, top: 90 },
  { size: 9, left: 90, top: 78 },
];

export default function CtaSection() {
  const { t, locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('cta-animate-in');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="container-qtech py-16 opacity-0 lg:py-24 cta-cta-hidden">
      <div
        className="relative overflow-hidden rounded-[2rem] px-10 py-20 text-center text-white shadow-2xl shadow-cyan-500/20 sm:px-16 sm:py-24"
        style={{
          background:
            'linear-gradient(135deg, #06b6d4 0%, #14b8a6 45%, #0ea5e9 80%, #f0fdf4 100%)',
        }}
      >
        {/* Soft sunspots */}
        {SUNSPOTS.map((s, i) => (
          <span
            key={`sun-${i}`}
            aria-hidden="true"
            className="cta-sunspot pointer-events-none absolute rounded-full bg-white/15 blur-xl"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.left}%`,
              top: `${s.top}%`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}

        {/* Static shells / sand grains */}
        {SHELLS.map((s, i) => (
          <span
            key={`shell-${i}`}
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-white/10 blur-sm"
            style={{ width: s.size, height: s.size, left: `${s.left}%`, top: `${s.top}%` }}
          />
        ))}

        {/* Gentle waves at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 overflow-hidden" aria-hidden="true">
          <div className="cta-wave absolute bottom-0 left-0 h-full w-[200%]">
            <svg className="h-full w-full" viewBox="0 0 2880 120" preserveAspectRatio="none" fill="none">
              <path
                d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z M1440,60 C1680,20 1920,100 2160,60 C2400,20 2640,100 2880,60 L2880,120 L1440,120 Z"
                fill="rgba(255,255,255,0.18)"
              />
            </svg>
          </div>
          <div className="cta-wave-slow absolute bottom-0 left-0 h-full w-[200%]" style={{ opacity: 0.5 }}>
            <svg className="h-full w-full" viewBox="0 0 2880 120" preserveAspectRatio="none" fill="none">
              <path
                d="M0,78 C300,42 600,112 900,78 C1200,42 1500,112 1800,78 C2100,42 2400,112 2700,78 C2820,62 2880,82 2880,82 L2880,120 L0,120 Z"
                fill="rgba(255,255,255,0.22)"
              />
            </svg>
          </div>
        </div>

        {/* Content layer */}
        <div className="relative z-10">
          <div className="cta-reveal cta-d1 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {locale === 'zh' ? '立即开启合作'
              : locale === 'ar' ? 'ابدأ التعاون الآن'
              : "Let's Build Something Great"}
          </div>

          <h2 className="cta-reveal cta-d2 mx-auto mt-7 max-w-3xl line-clamp-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {t('home.cta.title')}
          </h2>

          {t('home.cta.subtitle') && (
            <p className="cta-reveal cta-d2 mx-auto mt-4 line-clamp-2 max-w-xl text-base text-white/80 sm:text-lg">
              {t('home.cta.subtitle')}
            </p>
          )}

          <Link
            href={`/${locale}/contact`}
            className="cta-reveal cta-d3 group btn-sunset mt-10 px-8 py-3.5 text-base"
          >
            {t('home.cta.button')}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {t('home.cta.proof') && (
            <p className="cta-reveal cta-d4 mt-4 inline-flex items-center gap-1 text-sm text-white/70">
              <CheckCircle2 className="h-4 w-4" />
              {t('home.cta.proof')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
