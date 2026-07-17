'use client';

import { Check, Factory, Clock, Settings2, Globe, type LucideIcon } from 'lucide-react';
import { useLocale, type Locale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';

// V16 polish: per-card accent palette + tinted card surfaces break monotonous teal.
// Each advantage gets its own identity while staying cohesive.
interface AccentTheme {
  bar: string; // top accent bar gradient
  tint: string; // icon tile tint
  hoverTile: string; // icon tile darken on hover
  watermark: string; // watermark number tint on hover
}

const ACCENTS: AccentTheme[] = [
  {
    bar: 'from-brand-400 to-brand-600',
    tint: 'bg-brand-50 text-brand-700',
    hoverTile: 'group-hover:bg-brand-100',
    watermark: 'group-hover:text-brand-200',
  },
  {
    bar: 'from-amber-400 to-orange-500',
    tint: 'bg-amber-50 text-amber-600',
    hoverTile: 'group-hover:bg-amber-100',
    watermark: 'group-hover:text-amber-200',
  },
  {
    bar: 'from-emerald-400 to-teal-500',
    tint: 'bg-emerald-50 text-emerald-600',
    hoverTile: 'group-hover:bg-emerald-100',
    watermark: 'group-hover:text-emerald-200',
  },
  {
    bar: 'from-indigo-400 to-violet-500',
    tint: 'bg-indigo-50 text-indigo-600',
    hoverTile: 'group-hover:bg-indigo-100',
    watermark: 'group-hover:text-indigo-200',
  },
];

/** Three supporting bullet points per advantage (zh / en / ar). */
const POINTS: Record<Locale, string[]>[] = [
  {
    zh: ['广州自有工厂，价格更具竞争力', '品控全程可控，质量有保障', '支持小批量试单与 OEM 定制'],
    en: ['Guangzhou-owned factory for sharper pricing', 'End-to-end quality control you can trust', 'Low-MOQ trial orders & full OEM custom'],
    ar: ['مصنع خاص في غوانغتشو بأسعار أفضل', 'تحكم كامل في الجودة من البداية للنهاية', 'طلبات تجريبية بكميات صغيرة وتخصيص OEM'],
  },
  {
    zh: ['无人值守，降低人工运营成本', '远程监控与故障告警，运营无忧', '适配商场、社区、校园等公共场景'],
    en: ['Unattended operation cuts labour cost', 'Remote monitoring & fault alerts', 'Built for malls, campuses & public spaces'],
    ar: ['تشغيل ذاتي يخفض تكاليف اليد العاملة', 'مراقبة عن بُعد وتنبيهات الأعطال', 'مصممة للمولات والحرم الجامعية والأماكن العامة'],
  },
  {
    zh: ['品牌外观、配色与软件深度定制', '硬件配置按目标市场灵活调整', '多语言界面与本地支付对接'],
    en: ['Deep branding, colour & software custom', 'Hardware configs tuned to your market', 'Multilingual UI & local payment integration'],
    ar: ['تخصيص عميق للعلامة والألوان والبرمجيات', 'إعدادات الأجهزة حسب احتياجات سوقك', 'واجهة متعددة اللغات ودفع محلي'],
  },
  {
    zh: ['出口 60+ 国家，物流经验丰富', '木箱加固包装，海运无忧', '认证齐全（CE / ISO / RoHS）'],
    en: ['Shipped to 60+ countries, export-proven', 'Wooden-crate packing for safe sea freight', 'Full certifications: CE / ISO / RoHS'],
    ar: ['شحن إلى أكثر من 60 دولة بخبرة تصدير', 'تغليف بصناديق خشبية لشحن بحري آمن', 'شهادات كاملة: CE / ISO / RoHS'],
  },
];

export default function AdvantagesSection() {
  const { t, locale } = useLocale();
  const items: {
    number: number;
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
  }[] = [
    { number: 1, icon: Factory, titleKey: 'home.advantages.factoryDirect', descKey: 'home.advantages.factoryDirectDesc' },
    { number: 2, icon: Clock, titleKey: 'home.advantages.selfService', descKey: 'home.advantages.selfServiceDesc' },
    { number: 3, icon: Settings2, titleKey: 'home.advantages.oem', descKey: 'home.advantages.oemDesc' },
    { number: 4, icon: Globe, titleKey: 'home.advantages.globalShipping', descKey: 'home.advantages.globalShippingDesc' },
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50/80 to-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.advantages.eyebrow')}</p>
          <h2 className="section-title">{t('home.advantages.title')}</h2>
          <p className="section-subtitle">{t('home.advantages.subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            const accent = ACCENTS[i];
            const points = POINTS[i][locale] ?? POINTS[i].en;
            return (
              <RevealOnScroll key={item.titleKey} delay={i * 80} className="h-full">
                <OceanGlassCard depth="md" hoverLift className="group relative h-full border border-ocean-200/50">
                  <div className="flex h-full flex-col">
                    {/* Top accent bar — per-card identity colour */}
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${accent.bar}`} aria-hidden="true" />
                    {/* Big progressive step number */}
                    <span className={`absolute -end-2 -top-4 select-none text-7xl font-extrabold text-slate-100/15 transition-colors ${accent.watermark}`}>
                      <CountUp end={item.number} prefix="0" />
                    </span>

                    <div className="relative">
                      <IconTile
                        icon={Icon}
                        className="h-10 w-10"
                        tileClassName={`${accent.tint} p-5 transition-colors ${accent.hoverTile}`}
                        animate="float"
                      />
                      <h3 className="mt-4 text-xl font-bold text-ink-900">{t(item.titleKey)}</h3>
                      <p className="mt-2 text-sm text-ink-600">{t(item.descKey)}</p>
                    </div>

                    {/* Supporting bullet points — makes each card substantive */}
                    <ul className="mt-5 space-y-2.5">
                      {points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm leading-snug text-ink-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600" strokeWidth={2.5} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bottom decorative gradient line */}
                    <span className={`mt-auto block h-1 w-full rounded-full bg-gradient-to-r opacity-70 ${accent.bar}`} aria-hidden="true" />
                  </div>
                </OceanGlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
