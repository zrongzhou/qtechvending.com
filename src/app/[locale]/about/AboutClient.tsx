'use client';

import Link from 'next/link';
import {
  Lightbulb,
  ShieldCheck,
  Headphones,
  Factory,
  Target,
  Eye,
  Cog,
  Award,
  Clock,
  Globe2,
  Users,
  TrendingUp,
  BadgeCheck,
  Leaf,
  Radio,
  Microscope,
  BarChart3,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import CountUp from '@/components/ui/CountUp';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

export interface AboutSection {
  key: string;
  title: Record<string, string>;
  body: Record<string, string>;
  image?: string;
}

interface ValueItem {
  icon: LucideIcon;
  title: Record<string, string>;
  desc: Record<string, string>;
}

interface NumberItem {
  end: number;
  suffix: string;
  label: Record<string, string>;
}

interface MilestoneItem {
  year: string;
  title: Record<string, string>;
  desc: Record<string, string>;
}

interface CertBadge {
  name: string;
  icon: string; // lucide icon name
  full: Record<string, string>;
}

/* Lucide icon map for certification badges */
const CERT_ICON: Record<string, LucideIcon> = {
  ShieldCheck,
  BadgeCheck,
  Leaf,
  Radio,
  Microscope,
  Award,
};

/** Icon mapping — used when section photo is missing */
const SECTION_ICONS: Record<string, LucideIcon> = {
  story: Factory,
  mission: Target,
  vision: Eye,
  capability: Cog,
};

/* ── Six company strengths (migrated from source site) ── */
const VALUES: ValueItem[] = [
  {
    icon: Lightbulb,
    title: { en: 'Creative Design', zh: '创意设计', ar: 'تصميم إبداعي' },
    desc: {
      en: 'Our designs stay fresh and on-trend, giving every machine a distinctive, market-ready look.',
      zh: '设计始终新颖、紧跟潮流，让每台设备都拥有独特且契合市场的外观。',
      ar: 'تصاميمنا دائمًا حديثة وتواكب الاتجاهات، مما يمنح كل آلة مظهرًا مميزًا وجاهزًا للسوق.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Premium Materials', zh: '优质材料', ar: 'مواد فاخرة' },
    desc: {
      en: 'We build with the best-grade components so machines last through years of daily operation.',
      zh: '采用最优等级零部件制造，确保设备在长年日常运营中经久耐用。',
      ar: 'نبني بأفضل المكونات لتبقى الآلات صامدة عبر سنوات من التشغيل اليومي.',
    },
  },
  {
    icon: BarChart3,
    title: { en: 'Smart Management', zh: '智能管理', ar: 'إدارة ذكية' },
    desc: {
      en: 'Remote control and monitoring systems let operators manage fleets from anywhere.',
      zh: '远程控制与监控系统让运营者随时随地管理设备集群。',
      ar: 'أنظمة التحكم والمراقبة عن بُعد تتيح للمشغلين إدارة الأساطيل من أي مكان.',
    },
  },
  {
    icon: TrendingUp,
    title: { en: 'Affordable Quality', zh: '高性价比', ar: 'جودة بأسعار معقولة' },
    desc: {
      en: 'We keep costs down through vertical integration without sacrificing build quality.',
      zh: '通过垂直整合控制成本，同时绝不牺牲制造品质。',
      ar: 'نخفض التكاليف عبر التكامل الرأسي دون التضحية بجودة البناء.',
    },
  },
  {
    icon: Headphones,
    title: { en: 'All-Round Service', zh: '全程服务', ar: 'خدمة شاملة' },
    desc: {
      en: 'Advice and support from first inquiry to after-sales, in English, Chinese and Arabic.',
      zh: '从首次咨询到售后，提供中文、英文与阿拉伯语全程支持。',
      ar: 'استشارات ودعم من أول استفسار حتى ما بعد البيع بالإنجليزية والصينية والعربية.',
    },
  },
  {
    icon: RefreshCw,
    title: { en: 'Continuous Improvement', zh: '持续改进', ar: 'تحسين مستمر' },
    desc: {
      en: 'We keep refining our machines release after release to stay ahead of the market.',
      zh: '我们在一代又一代产品中持续打磨，始终领先市场。',
      ar: 'نواصل تحسين آلاتنا إصدارًا بعد إصدار لتبقى في المقدمة.',
    },
  },
];

/* ── Key facts ── */
const NUMBERS: NumberItem[] = [
  { end: 11, suffix: '+', label: { en: 'Product categories', zh: '产品品类', ar: 'فئات المنتجات' } },
  { end: 60, suffix: '+', label: { en: 'Countries served', zh: '服务国家', ar: 'دول نخدمها' } },
  { end: 500, suffix: '+', label: { en: 'Global partners', zh: '全球合作伙伴', ar: 'شركاء عالميون' } },
  { end: 24, suffix: '/7', label: { en: 'Self-service operation', zh: '无人自助运营', ar: 'تشغيل ذاتي' } },
];

/* ── Manufacturing process cards ── */
const MANU_CARDS = [
  {
    img: '/images/about/factory-assembly.webp',
    icon: Factory,
    title: { en: 'Automated Assembly Line', zh: '自动化装配线', ar: 'خط التجميع الآلي' },
    desc: {
      en: 'Robotic arms & skilled technicians assemble every cabinet on our ISO-certified production line in Guangzhou.',
      zh: '在广州的 ISO 认证生产线上，由机械臂与熟练技师组装每一台设备。',
      ar: 'ذراعات آلية وفنيون ماهرون يجمعون كل خزانة على خط الإنتاج المعتمد من ISO في غوانغتشو.',
    },
  },
  {
    img: '/images/about/factory-rnd.webp',
    icon: Cog,
    title: { en: 'R&D & Innovation Center', zh: '研发与创新中心', ar: 'مركز البحث والتطوير والابتكار' },
    desc: {
      en: '20+ engineers drive continuous improvement in smart payment, IoT monitoring and energy-efficient cooling systems.',
      zh: '20+ 名工程师持续推进智能支付、IoT 监控和节能制冷系统的迭代升级。',
      ar: 'أكثر من 20 مهندسًا يقودون التحسين المستمر للدفع الذكي ومراقبة إنترنت الأشياء وأنظمة التبريد الموفرة للطاقة.',
    },
  },
  {
    img: '/images/about/factory-qc.webp',
    icon: ShieldCheck,
    title: { en: 'Strict QC Testing', zh: '严格质检体系', ar: 'نظام مراقبة الجودة الصارم' },
    desc: {
      en: 'Each unit undergoes 48-hour burn-in testing, drop test, and environmental simulation before leaving the factory.',
      zh: '每台设备在出厂前经过 48 小时老化测试、跌落试验和环境模拟测试。',
      ar: 'خضعت كل وحدة لاختبار الاحتراق لمدة 48 ساعة وسقوط ومحاكاة بيئية قبل مغادرة المصنع.',
    },
  },
  {
    img: '/images/about/factory-warehouse.webp',
    icon: Globe2,
    title: { en: 'Global Logistics Hub', zh: '全球物流枢纽', ar: 'مركز لوجستي عالمي' },
    desc: {
      en: 'Strategic warehouse near Guangzhou Port enables fast shipping to 60+ countries within 7–15 days.',
      zh: '广州港附近战略仓储，确保 7–15 天内发货至全球 60+ 国家和地区。',
      ar: 'مخزون استراتيجي بالقرب من ميناء غوانغتشو يتيح الشحن السريع إلى أكثر من 60 دولة خلال 7–15 يومًا.',
    },
  },
];

/* ── Global success stories (real deployments) ── */
const STORIES = [
  {
    image:
      '/images/products/good-capacity-smart-locker-flower-vending-machine-selling-different-fresh-flowergift-in-subway/1.jpeg',
    title: { en: 'Subway Fresh-Flower Kiosk', zh: '地铁鲜花自助柜', ar: 'كشك الزهور الطازجة في المترو' },
    sub: {
      en: 'Deployed across metro stations in Southeast Asia.',
      zh: '已落地东南亚多个地铁站。',
      ar: 'تم نشره في محطات المترو في جنوب شرق آسيا.',
    },
  },
  {
    image:
      '/images/products/hot-food-pizza-vending-machine-self-service-selling-and-heating-pizza-bring-convenience-to-people/1.jpeg',
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: 'بيتزا الحرم الجامعي 24/7' },
    sub: {
      en: 'Serving students late-night on a European campus.',
      zh: '为欧洲校园师生提供深夜热食。',
      ar: 'تقديم الطعام الساخن لطلاب الحرم الجامعي في وقت متأخر.',
    },
  },
  {
    image:
      '/images/products/different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized/1.jpeg',
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'روبوت آيس كريم بتصميم العلامة التجارية' },
    sub: {
      en: 'OEM branding for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制。',
      ar: 'تخصيص OEM لسلسلة بيع بالتجزئة في الشرق الأوسط.',
    },
  },
  {
    image:
      '/images/products/2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design/1.jpeg',
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'مكتب قهوة المكاتب' },
    sub: {
      en: 'Energy-saving coffee in corporate lobbies.',
      zh: '企业大堂的节能咖啡方案。',
      ar: 'قهوة موفرة للطاقة في بهو الشركات.',
    },
  },
  {
    image:
      '/images/products/fresh-sugarcane-orange-juice-vending-machine-24-hours-self-service-with-system/1.jpeg',
    title: { en: 'Juice Bar, Zero Staff', zh: '无人鲜榨果汁吧', ar: 'مفهوم عصير بلا موظفين' },
    sub: {
      en: 'Fresh juice vending in a beachside resort.',
      zh: '海滨度假村的鲜榨果汁售货。',
      ar: 'بيع عصير طازج في منتجع على الشاطئ.',
    },
  },
  {
    image:
      '/images/products/the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options/1.webp',
    title: { en: 'Pet Spa on the Street', zh: '街头宠物洗护站', ar: 'سبا للحيوانات في الشارع' },
    sub: {
      en: 'Self-service pet wash in a residential district.',
      zh: '社区中的自助宠物洗护。',
      ar: 'غسيل حيوانات ذاتي في حي سكني.',
    },
  },
];

/* ── Category tag per story (keeps image ↔ copy consistent) ── */
const STORY_CATS = [
  { en: 'Flower Vending', zh: '鲜花售货', ar: 'بيع الزهور' },
  { en: 'Pizza Vending', zh: '披萨售货', ar: 'بيع البيتزا' },
  { en: 'Ice-Cream Robot', zh: '冰淇淋机器人', ar: 'روبوت آيس كريم' },
  { en: 'Coffee Vending', zh: '咖啡售货', ar: 'بيع القهوة' },
  { en: 'Juice Vending', zh: '果汁售货', ar: 'بيع العصير' },
  { en: 'Pet Wash', zh: '宠物洗护', ar: 'غسيل الحيوانات' },
];

/* ── Company timeline ── */
const TIMELINE: MilestoneItem[] = [
  {
    year: '2014',
    title: { en: 'Company Founded', zh: '公司成立', ar: 'تأسيس الشركة' },
    desc: {
      en: 'Qtech established in Guangzhou, focusing on smart vending machine R&D and manufacturing.',
      zh: 'Qtech 在广州成立，专注智能售货机研发制造。',
      ar: 'تأسست كيتك في غوانغتشو، تركز على البحث والتطوير وتصنيع آلات البيع الذكية.',
    },
  },
  {
    year: '2016',
    title: { en: 'First Export', zh: '首次出口', ar: 'أول تصدير' },
    desc: {
      en: 'Shipped first batch of fresh-flower vending machines to Southeast Asian markets.',
      zh: '首批鲜花自动售货机出口至东南亚市场。',
      ar: 'شُحنت أول دفعة من آلات بيع الزهور الطازجة إلى أسواق جنوب شرق آسيا.',
    },
  },
  {
    year: '2018',
    title: { en: 'R&D Center Launched', zh: '研发中心成立', ar: 'إطلاق مركز البحث والتطوير' },
    desc: {
      en: 'Dedicated R&D team formed, securing 20+ utility and design patents.',
      zh: '组建专职研发团队，获 20+ 项实用新型与外观专利。',
      ar: 'تشكيل فريق بحث وتطوير مخصص، وحماية أكثر من 20 براءة اختراع.',
    },
  },
  {
    year: '2020',
    title: { en: 'Global Expansion', zh: '全球化布局', ar: 'التوسع العالمي' },
    desc: {
      en: 'Products now serving 40+ countries across Europe, Middle East, Africa and Americas.',
      zh: '产品覆盖欧洲、中东、非洲、美洲等 40+ 国家和地区。',
      ar: 'منتجاتنا تخدم الآن أكثر من 40 دولة في أوروبا والشرق الأوسط وأفريقيا والأمريكتين.',
    },
  },
  {
    year: '2022',
    title: { en: 'Smart IoT Platform', zh: '智能 IoT 平台', ar: 'منصة ذكية لإنترنت الأشياء' },
    desc: {
      en: 'Launched cloud-based remote management platform for real-time inventory and sales analytics.',
      zh: '推出基于云的远程管理平台，支持实时库存与销售数据分析。',
      ar: 'إطلاق منصة إدارة عن بعد قائمة على السحابة لتحليل المخزون والمبيعات في الوقت الفعلي.',
    },
  },
  {
    year: '2024',
    title: { en: 'AI-Powered Product Line', zh: 'AI 智能产品线', ar: 'خط منتجات مدعوم بالذكاء الاصطناعي' },
    desc: {
      en: 'Introduced AI-driven recommendation engine and computer vision quality inspection system.',
      zh: '引入 AI 推荐引擎与机器视觉质检系统。',
      ar: 'إدخال محرك توصيات مدعوم بالذكاء الاصطناعي ونظام فحص جودة الرؤية الحاسوبية.',
    },
  },
];

/* ── Certifications ── */
const CERTS: CertBadge[] = [
  { name: 'CE', icon: 'ShieldCheck', full: { en: 'CE Certified', zh: 'CE 认证', ar: 'معتمد CE' } },
  { name: 'ISO 9001', icon: 'BadgeCheck', full: { en: 'ISO 9001 Quality System', zh: 'ISO 9001 质量管理体系', ar: 'نظام جودة ISO 9001' } },
  { name: 'RoHS', icon: 'Leaf', full: { en: 'RoHS Compliant', zh: 'RoHS 环保合规', ar: 'متوافق مع RoHS' } },
  { name: 'FCC', icon: 'Radio', full: { en: 'FCC Approved', zh: 'FCC 认证', ar: 'معتمد FCC' } },
  { name: 'SGS', icon: 'Microscope', full: { en: 'SGS Tested', zh: 'SGS 检测认证', ar: 'تم اختباره بواسطة SGS' } },
  { name: 'Patents 20+', icon: 'Award', full: { en: '20+ Patents', zh: '20+ 项专利', ar: 'أكثر من 20 براءة اختراع' } },
];

/* ── Hero stat cards (under hero) ── */
const HERO_STATS = [
  { end: 11, suffix: '+', icon: Factory, key: 'hero.statCategories' },
  { end: 60, suffix: '+', icon: Globe2, key: 'hero.statCountries' },
  { end: 500, suffix: '+', icon: Users, key: 'hero.statPartners' },
  { end: 24, suffix: '/7', icon: Clock, key: 'hero.statService' },
];

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  return (
    <div>
      {/* ════════ 1. HERO ════════ */}
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden="true" />
        {/* Soft brand glow */}
        <div className="tech-glow" />

        <div className="container-qtech relative py-16 text-center lg:py-22">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            {t('about.badge') || 'About Qtech'}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{t('about.title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{t('about.subtitle')}</p>

          {/* Stat band under hero */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {HERO_STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:p-5">
                  <div className="flex items-center justify-center gap-2 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <dt className="mt-2 text-3xl font-extrabold">
                    <CountUp end={s.end} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-0.5 text-sm text-white/75">{t(s.key)}</dd>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ 2. STORY SECTIONS (from DB) ════════ */}
      <div className="container-qtech space-y-16 py-16 lg:py-20">
        {sections.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          const SectionIcon = SECTION_ICONS[section.key] || Factory;
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
                      <p key={i} className="mb-4 leading-relaxed text-ink-600">{p}</p>
                    ))}
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200">
                {/* Icon fallback layer */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
                  <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
                    <SectionIcon className="h-14 w-14" strokeWidth={1.5} />
                  </div>
                  <p className="mt-5 text-center text-lg font-semibold">{title}</p>
                  <div className="mt-3 h-1 w-16 rounded-full bg-white/30" />
                </div>
                {/* Real photo overlay */}
                {section.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={section.image}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            </section>
          );
        })}

        {/* ════════ 3. MANUFACTURING & QUALITY ════════ */}
        <section className="overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-white lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
              <Factory className="h-4 w-4" />
              {locale === 'zh' ? '智造实力' : locale === 'ar' ? 'قدرات التصنيع' : 'Manufacturing Capability'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
              {locale === 'zh' ? '从研发到交付的全链路品质保障'
                : locale === 'ar' ? 'ضمان الجودة من البحث حتى التسليم'
                : 'End-to-End Quality from R&D to Delivery'}
            </h2>
            <p className="mt-3 text-white/80">
              {locale === 'zh'
                ? '位于广州的现代化生产基地，配备自动化产线、专业研发团队与严格质检体系。'
                : locale === 'ar'
                  ? 'منشأة إنتاجية حديثة في غوانغتشو مجهزة بخط إنتاج آلي وفريق بحث متخصص ونظام مراقبة جودة صارم.'
                  : 'Our modern production base in Guangzhou features automated assembly lines, dedicated R&D teams, and rigorous QC protocols.'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {MANU_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={localized(card.title, locale)}
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={card.img}
                      alt={localized(card.title, locale)}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                        <Icon className="h-4.5 w-4.5 text-cyan-200" />
                      </div>
                      <h3 className="text-base font-semibold">{localized(card.title, locale)}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{localized(card.desc, locale)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════ 4. GLOBAL SUCCESS STORIES ════════ */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              {locale === 'zh' ? '全球落地案例' : locale === 'ar' ? 'قصص النجاح العالمية' : 'Global Success Stories'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {t('home.partners.title') || 'Global Partners & Success Stories'}
            </h2>
            <p className="mt-2 text-ink-500">
              {t('home.partners.subtitle') ||
                (locale === 'zh' ? '我们的设备已在全球多个场景稳定运行'
                  : locale === 'ar' ? 'تعمل أجهزتنا بشكل موثوق في سيناريوهات متعددة حول العالم'
                  : 'Our equipment runs reliably in diverse real-world scenarios worldwide')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((s, i) => {
              const cat = STORY_CATS[i];
              return (
                <div
                  key={localized(s.title, locale)}
                  className="group relative overflow-hidden rounded-2xl pro-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={s.title[locale] || s.title.en}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
                    {/* Category tag overlay */}
                    <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
                      {cat[locale] || cat.en}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-ink-900">{s.title[locale] || s.title.en}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-500">{s.sub[locale] || s.sub.en}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════ 5. CORE VALUES ════════ */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-brand-50/30 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">{t('about.valuesTitle') || 'Our Values'}</h2>
            <p className="mt-2 text-ink-500">{t('about.valuesSubtitle') || 'What drives us forward every day.'}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={localized(v.title, locale)} className="pro-card group relative p-6 text-center">
                  {/* Oversized index watermark */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-2 select-none text-6xl font-black text-slate-100/50"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm transition group-hover:scale-110 group-hover:shadow-lg">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="relative mt-4 text-lg font-bold text-ink-900">{localized(v.title, locale)}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{localized(v.desc, locale)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════ 6. COMPANY TIMELINE ════════ */}
        <section className="bg-gradient-to-br from-ink-800 via-ink-900 to-brand-900 px-8 py-14 text-white lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-cyan-200">
              {locale === 'zh' ? '发展历程' : locale === 'ar' ? 'رحلتنا الزمنية' : 'Our Journey'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">
              {locale === 'zh' ? '十年深耕，从广州走向世界'
                : locale === 'ar' ? 'عقد من الخبرة: من غوانغتشو إلى العالم'
                : 'A Decade of Excellence, From Guangzhou to the World'}
            </h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-3xl">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-[19px] hidden w-px bg-white/15 md:block translate-x-1/2" />

            <div className="space-y-8">
              {TIMELINE.map((m) => (
                <div key={m.year} className="relative flex gap-5 pl-0 md:pl-12">
                  {/* Dot */}
                  <div className="absolute left-0 top-1 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold shadow-lg shadow-brand-500/25 ring-4 ring-ink-900 md:left-0">
                    {m.year.slice(-2)}
                  </div>
                  <div className="glass-card-dark flex-1 rounded-xl p-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-brand-400">{m.year}</span>
                      <h3 className="text-base font-semibold text-white">{localized(m.title, locale)}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{localized(m.desc, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ 7. CERTIFICATIONS ════════ */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              🏆 {locale === 'zh' ? '资质认证' : locale === 'ar' ? 'شهادات الاعتماد' : 'Certifications & Compliance'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '国际标准，品质保证'
                : locale === 'ar' ? 'معايير دولية، ضمان الجودة'
                : 'International Standards, Guaranteed Quality'}
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CERTS.map((cert) => {
              const CertIcon = CERT_ICON[cert.icon] || ShieldCheck;
              return (
                <div
                  key={cert.name}
                  className="pro-card group flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
                >
                  <CertIcon className="h-8 w-8 text-brand-600" strokeWidth={1.6} />
                  <span className="text-xs font-bold tracking-tight text-ink-900">{cert.name}</span>
                  <span className="hidden text-[11px] leading-snug text-ink-400 group-hover:block">
                    {cert.full[locale] || cert.full.en}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════ 8. KEY NUMBERS ════════ */}
        <section className="overflow-hidden rounded-3xl bg-brand-gradient px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('about.statsTitle') || 'Qtech by Numbers'}</h2>
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

        {/* ════════ 9. CTA ════════ */}
        <section className="rounded-3xl bg-ink-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">{t('about.cta') || 'Ready to Partner with Qtech?'}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            {locale === 'zh'
              ? '联系我们获取定制报价与技术方案。'
              : locale === 'ar'
                ? 'تواصل معنا للحصول على عرض سعر مخصص وحلول تقنية.'
                : 'Contact us for custom quotes and technical solutions.'}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="btn-primary mt-8 px-8 py-3.5 text-sm"
          >
            {t('nav.getQuote') || 'Get a Quote'} →
          </Link>
        </section>
      </div>
    </div>
  );
}
