'use client';

import Link from 'next/link';
import { Lightbulb, ShieldCheck, Headphones, Handshake } from 'lucide-react';
import { type ComponentType } from 'react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import CountUp from '@/components/ui/CountUp';

export interface AboutSection {
  key: string;
  title: Record<string, string>;
  body: Record<string, string>;
  image?: string;
}

interface ValueItem {
  icon: ComponentType<{ className?: string }>;
  title: Record<string, string>;
  desc: Record<string, string>;
}

interface NumberItem {
  end: number;
  suffix: string;
  label: Record<string, string>;
}

/** Four core values rendered as a glass-card grid below the story sections. */
const VALUES: ValueItem[] = [
  {
    icon: Lightbulb,
    title: { en: 'Innovation', zh: '创新驱动', ar: 'الابتكار' },
    desc: {
      en: 'Continuous R&D in vending mechanics, IoT and payment keeps our machines ahead.',
      zh: '在售货机械、物联网与支付领域持续研发，让我们的设备始终领先。',
      ar: 'تطوير مستمر في ميكانيكا البيع وإنترنت الأشياء والدفع لإبقاء آلاتنا في المقدمة.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Quality First', zh: '品质为先', ar: 'الجودة أولاً' },
    desc: {
      en: 'Every unit is tested end-to-end in our Guangzhou facility before shipment.',
      zh: '每台设备在广州工厂出厂前都经过端到端测试。',
      ar: 'تُختبر كل وحدة بشكل شامل في منشأتنا بغوانغتشو قبل الشحن.',
    },
  },
  {
    icon: Headphones,
    title: { en: 'Customer Service', zh: '贴心服务', ar: 'خدمة العملاء' },
    desc: {
      en: 'Pre-sale consultation and after-sales support in English, Chinese and Arabic.',
      zh: '提供中文、英文与阿拉伯语售前咨询与售后支持。',
      ar: 'استشارات ما قبل البيع ودعم ما بعد البيع بالإنجليزية والصينية والعربية.',
    },
  },
  {
    icon: Handshake,
    title: { en: 'Integrity', zh: '诚信共赢', ar: 'النزاهة' },
    desc: {
      en: 'Transparent pricing and honest partnership with distributors worldwide.',
      zh: '透明的价格与全球经销商的诚信合作。',
      ar: 'أسعار شفافة وشراكة صادقة مع الموزعين حول العالم.',
    },
  },
];

/** Key facts animated with CountUp. Mirrors the claims used across the site. */
const NUMBERS: NumberItem[] = [
  { end: 11, suffix: '+', label: { en: 'Product categories', zh: '产品品类', ar: 'فئات المنتجات' } },
  { end: 60, suffix: '+', label: { en: 'Countries served', zh: '服务国家', ar: 'دول نخدمها' } },
  { end: 500, suffix: '+', label: { en: 'Global partners', zh: '全球合作伙伴', ar: 'شركاء عالميون' } },
  { end: 24, suffix: '/7', label: { en: 'Self-service operation', zh: '无人自助运营', ar: 'تشغيل ذاتي' } },
];

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  return (
    <div>
      <section className="bg-brand-gradient text-white">
        <div className="container-qtech py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{t('about.title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{t('about.subtitle')}</p>
        </div>
      </section>

      <div className="container-qtech space-y-16 py-16 lg:py-20">
        {sections.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          return (
            <section
              key={section.key}
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
                <div className="prose-qtech mt-4">
                  {body
                    .split(/\n{2,}/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-ink-600">
                        {p}
                      </p>
                    ))}
                </div>
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.image || '/images/og-default.svg'}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
                  }}
                />
              </div>
            </section>
          );
        })}

        {/* Core Values */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t('about.valuesTitle')}</h2>
            <p className="mt-2 text-ink-500">{t('about.valuesSubtitle')}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={localized(v.title, locale)} className="glass-card group p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">{localized(v.title, locale)}</h3>
                  <p className="mt-2 text-sm text-ink-500">{localized(v.desc, locale)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Key numbers */}
        <section className="overflow-hidden rounded-3xl bg-brand-gradient px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('about.statsTitle')}</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {NUMBERS.map((n) => (
              <div key={localized(n.label, locale)}>
                <dt className="text-4xl font-extrabold">
                  <CountUp end={n.end} suffix={n.suffix} />
                </dt>
                <dd className="mt-2 text-sm text-white/85">{localized(n.label, locale)}</dd>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-ink-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">{t('about.cta')}</h2>
          <Link
            href={`/${locale}/contact`}
            className="mt-6 inline-flex rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            {t('nav.getQuote')}
          </Link>
        </section>
      </div>
    </div>
  );
}
