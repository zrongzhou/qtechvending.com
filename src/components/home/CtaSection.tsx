'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

/* ── Floating particle data (pre-computed for performance) ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 3 + (i % 5),
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  delay: (i % 6) * 0.7,
  duration: 4 + (i % 5),
  opacity: 0.15 + ((i % 4) * 0.08),
}));

/* ── Ring burst decorations ── */
const RINGS = [
  { size: 220, delay: 0, left: 78, top: 12 },
  { size: 150, delay: 1.5, left: 12, top: 70 },
  { size: 100, delay: 3, left: 68, top: 82 },
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
    <section
      ref={sectionRef}
      className="container-qtech py-16 opacity-0 lg:py-24 cta-cta-hidden"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-600 px-8 py-16 text-center text-white shadow-2xl shadow-brand-500/20 sm:px-12 sm:py-20">
        {/* Animated mesh gradient overlay */}
        <div className="cta-mesh pointer-events-none absolute inset-0 opacity-40" />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            aria-hidden="true"
            className="absolute rounded-full bg-white cta-particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* Decorative rings */}
        {RINGS.map((r, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full border border-white/10 cta-ring"
            style={{
              width: r.size,
              height: r.size,
              left: `${r.left}%`,
              top: `${r.top}%`,
              animationDelay: `${r.delay}s`,
            }}
          />
        ))}

        {/* Content layer */}
        <div className="relative z-10">
          <div className="cta-reveal cta-d1 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4 cta-pulse" />
            {locale === 'zh' ? '立即开启合作'
              : locale === 'ar' ? 'ابدأ التعاون الآن'
              : "Let's Build Something Great"}
          </div>

          <h2 className="cta-reveal cta-d2 mx-auto mt-7 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            {t('home.cta.title')}
            <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-white to-purple-200 bg-clip-text text-transparent">
              {t('home.cta.subtitle')}
            </span>
          </h2>

          <Link
            href={`/${locale}/contact`}
            className="cta-reveal cta-d3 group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-9 py-4 text-base font-bold text-brand-700 shadow-xl shadow-black/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent cta-shimmer" />
            {t('home.cta.button')}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute inset-0 rounded-full ring-1 ring-white/30 cta-pulse-ring" />
          </Link>

          {t('home.cta.proof') && (
            <p className="cta-reveal cta-d4 mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-white/12 px-5 py-2 text-sm font-medium backdrop-blur-sm">
              <Star className="h-4 w-4 fill-current cta-spin" />
              {t('home.cta.proof')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
