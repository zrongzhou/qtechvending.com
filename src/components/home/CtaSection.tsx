'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

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
        className="tech-glow relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 px-10 py-20 text-center text-white shadow-2xl shadow-brand-700/20 sm:px-16 sm:py-24"
      >
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
            className="cta-reveal cta-d3 group btn-primary mt-10 px-8 py-3.5 text-base"
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
