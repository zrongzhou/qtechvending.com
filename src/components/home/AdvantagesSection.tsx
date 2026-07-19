'use client';

import { CheckCircle2, Factory, Clock, Settings2, Globe, type LucideIcon } from 'lucide-react';
import { useLocale, type Locale } from '@/lib/i18n';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';

// V33: each advantage gets a distinct accent identity (blue / amber / violet /
// emerald) so the four cards no longer look like identical teal rectangles.
interface AccentTheme {
  bar: string; // top accent bar gradient
  tile: string; // icon tile gradient surface
  check: string; // bullet check colour
  leftBorder: string; // card left-border colour
  glow: string; // hover box-shadow (coloured glow + glass highlight)
  watermark: string; // watermark number tint on hover
  text: string; // "learn more" link colour
}

const ACCENTS: AccentTheme[] = [
  {
    // Card 1 — 工厂直供 — blue/cyan (trust)
    bar: 'from-blue-500 to-cyan-400',
    tile: 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white',
    check: 'text-blue-500',
    leftBorder: 'border-blue-400',
    glow: 'hover:shadow-[0_20px_50px_rgba(59,130,246,0.28),inset_0_1px_0_rgba(255,255,255,0.6)]',
    watermark: 'group-hover:text-blue-200',
    text: 'text-blue-600',
  },
  {
    // Card 2 — 24/7运营 — amber/orange (availability)
    bar: 'from-amber-400 to-orange-500',
    tile: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
    check: 'text-amber-500',
    leftBorder: 'border-amber-400',
    glow: 'hover:shadow-[0_20px_50px_rgba(245,158,11,0.28),inset_0_1px_0_rgba(255,255,255,0.6)]',
    watermark: 'group-hover:text-amber-200',
    text: 'text-amber-600',
  },
  {
    // Card 3 — OEM定制 — violet/purple (creative custom)
    bar: 'from-violet-500 to-purple-600',
    tile: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
    check: 'text-violet-500',
    leftBorder: 'border-violet-400',
    glow: 'hover:shadow-[0_20px_50px_rgba(139,92,246,0.28),inset_0_1px_0_rgba(255,255,255,0.6)]',
    watermark: 'group-hover:text-violet-200',
    text: 'text-violet-600',
  },
  {
    // Card 4 — 全球发货 — emerald/teal (global)
    bar: 'from-emerald-400 to-teal-500',
    tile: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
    check: 'text-emerald-500',
    leftBorder: 'border-emerald-400',
    glow: 'hover:shadow-[0_20px_50px_rgba(16,185,129,0.28),inset_0_1px_0_rgba(255,255,255,0.6)]',
    watermark: 'group-hover:text-emerald-200',
    text: 'text-emerald-600',
  },
];

/** Three supporting bullet points per advantage (zh / en / ar). */
const POINTS: Record<Locale, string[]>[] = [
  {
    zh: ['广州自有工厂，价格更具竞争力', '品控全程可控，质量有保障', '支持小批量试单与 OEM 定制'],
    en: ['Guangzhou-owned factory for sharper pricing', 'End-to-end quality control you can trust', 'Low-MOQ trial orders & full OEM custom'],
    ar: ['مصنع خاص في غوانغشو بأسعار أفضل', 'تحكم كامل في الجودة من البداية للنهاية', 'طلبات تجريبية بكميات صغيرة وتخصيص OEM'],
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
    <section className="bg-atmosphere-blue py-20 md:py-28">
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
            <RevealOnScroll key={item.titleKey} delay={i * 100} className="h-full">
              <div className="relative h-full">
                {/* Soft colored glow behind the glass card so it pops visually */}
                <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-20 blur-xl ${accent.bar}`} aria-hidden="true" />
                {/* V41: calmer card — lighter blur (depth sm), higher opacity fill,
                    solid 2px border + coloured left edge, higher text contrast.
                    V44: removed the up/down float animation (user found it
                    distracting) and replaced the translateY hover with a subtle
                    scale + shadow-deepen so the card stays put but still reacts. */}
                <OceanGlassCard depth="sm" hoverLift={false} className={`group relative z-10 h-full border-2 border-slate-200/80 border-l-4 ${accent.leftBorder} ${accent.glow} bg-white/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
                  <div className="flex h-full flex-col p-7">
                    {/* Top accent bar — per-card identity colour */}
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${accent.bar}`} aria-hidden="true" />
                    {/* Big progressive step number */}
                    <span className={`absolute -end-2 -top-4 select-none text-7xl font-extrabold text-slate-100/15 transition-colors ${accent.watermark}`}>
                      <CountUp end={item.number} prefix="0" />
                    </span>

                    <div className="relative">
                      <IconTile
                        icon={Icon}
                        className="h-14 w-14"
                        tileClassName={`${accent.tile} flex items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:animate-spin-slow`}
                        animate="float"
                      />
                      <h3 className="mt-5 text-xl font-bold text-ink-900">{t(item.titleKey)}</h3>
                      {/* V41: deeper contrast (ink-600 → ink-800) so copy reads crisp. */}
                      <p className="mt-2 text-sm text-ink-800">{t(item.descKey)}</p>
                    </div>

                    {/* Supporting bullet points — each has a coloured left accent */}
                    <ul className="mt-5 space-y-3">
                      {points.map((p) => (
                        <li key={p} className={`flex items-start gap-2 border-s-2 ps-3 text-sm leading-relaxed text-ink-800 ${accent.leftBorder}`}>
                          <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent.check}`} strokeWidth={2.25} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Learn more with slide-in underline in accent colour */}
                    <a
                      href={`/${locale}/products`}
                      className={`relative mt-4 inline-flex w-fit items-center text-sm font-semibold ${accent.text} transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full`}
                    >
                      {locale === 'zh' ? '了解更多' : locale === 'ar' ? 'اعرف المزيد' : 'Learn more'} →
                    </a>

                    {/* Bottom decorative gradient line */}
                    <span className={`mt-auto block h-1 w-full rounded-full bg-gradient-to-r opacity-70 ${accent.bar}`} aria-hidden="true" />
                  </div>
                </OceanGlassCard>
              </div>
            </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
