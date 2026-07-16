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
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

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
  {
    icon: BadgeCheck,
    title: { en: 'Quality Assurance', zh: '品质保证', ar: 'ضمان الجودة' },
    desc: {
      en: 'Strict QC and a 2-year warranty back every machine we ship from Guangzhou.',
      zh: '严格的质检与两年保修，为每一台出厂设备保驾护航。',
      ar: 'رقابة جودة صارمة وضمان لمدة عامين يدعمان كل آلة نشحنها من غوانغتشو.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'International Certifications', zh: '国际认证', ar: 'شهادات دولية' },
    desc: {
      en: 'Our machines are built to ISO and CE standards for smooth global compliance.',
      zh: '设备依据 ISO 与 CE 标准制造，满足全球合规要求。',
      ar: 'تُصنع آلاتنا وفق معايير ISO وCE لامتثال عالمي سلس.',
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
    img: '/images/about/factory-assembly.png',
    icon: Factory,
    title: { en: 'Automated Assembly Line', zh: '自动化装配线', ar: 'خط التجميع الآلي' },
    desc: {
      en: 'Robotic arms & skilled technicians assemble every cabinet on our ISO-certified production line in Guangzhou.',
      zh: '在广州的 ISO 认证生产线上，由机械臂与熟练技师组装每一台设备。',
      ar: 'ذراعات آلية وفنيون ماهرون يجمعون كل خزانة على خط الإنتاج المعتمد من ISO في غوانغتشو.',
    },
  },
  {
    img: '/images/about/factory-rnd.png',
    icon: Cog,
    title: { en: 'R&D & Innovation Center', zh: '研发与创新中心', ar: 'مركز البحث والتطوير والابتكار' },
    desc: {
      en: '20+ engineers drive continuous improvement in smart payment, IoT monitoring and energy-efficient cooling systems.',
      zh: '20+ 名工程师持续推进智能支付、IoT 监控和节能制冷系统的迭代升级。',
      ar: 'أكثر من 20 مهندسًا يقودون التحسين المستمر للدفع الذكي ومراقبة إنترنت الأشياء وأنظمة التبريد الموفرة للطاقة.',
    },
  },
  {
    img: '/images/about/factory-qc.png',
    icon: ShieldCheck,
    title: { en: 'Strict QC Testing', zh: '严格质检体系', ar: 'نظام مراقبة الجودة الصارم' },
    desc: {
      en: 'Each unit undergoes 48-hour burn-in testing, drop test, and environmental simulation before leaving the factory.',
      zh: '每台设备在出厂前经过 48 小时老化测试、跌落试验和环境模拟测试。',
      ar: 'خضعت كل وحدة لاختبار الاحتراق لمدة 48 ساعة وسقوط ومحاكاة بيئية قبل مغادرة المصنع.',
    },
  },
  {
    img: '/images/about/factory-warehouse.png',
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

/* ── Company intro (brief copy) ── */
const COMPANY_INTRO: { body: Record<string, string>; image: string } = {
  image: '/images/about/factory-assembly.png',
  body: {
    en: "Welcome to our official website. We're a Qiuyan (Qtech) vending company dedicated to developing, manufacturing, and selling vending machines. We're all about using innovative technology to offer convenient, efficient, and personalized vending solutions. Our main products are ice, fruit, cotton candy, pizza, and flower vending machines, which not only satisfy the market's appetite for novel experiences but also reflect our commitment to quality and service.",
    zh: '欢迎访问秋彦(Qtech)官方网站。我们致力于开发、制造和销售售货机，专注运用创新技术提供便捷高效个性化的售货解决方案。主要产品是冰激凌、水果、棉花糖、披萨和鲜花售货机。',
    ar: 'مرحبًا بكم في موقعنا الرسمي لشركة كيويان (Qtech). نحن شركة لآلات البيع مكرسة لتطوير وتصنيع وبيع آلات البيع. نركز على استخدام التكنولوجيا المبتكرة لتقديم حلول بيع مريحة وفعالة وشخصية. منتجاتنا الرئيسية هي آلات بيع الآيس كريم والفواكه والحلوى القطنية والبيتزا والزهور، التي لا تلبي شهية السوق للتجارب الجديدة فحسب، بل تعكس أيضًا التزامنا بالجودة والخدمة.',
  },
};

/* ── Certificate image gallery ── */
const CERT_GALLERY = [
  { img: '/images/about/certificate-1.svg', label: { en: 'Guangzhou Tax & Statistics Medal', zh: '广州市纳税纳统奖牌', ar: 'ميدالية الضرائب والإحصاء في غوانغتشو' } },
  { img: '/images/about/certificate-2.svg', label: { en: 'High-Tech Enterprise', zh: '高新技术企业', ar: 'مؤسسة التكنولوجيا العالية' } },
  { img: '/images/about/certificate-3.svg', label: { en: 'CE Certified', zh: 'CE 认证', ar: 'معتمد CE' } },
  { img: '/images/about/certificate-4.svg', label: { en: 'ISO 9001 Certified', zh: 'ISO 认证', ar: 'معتمد ISO' } },
  { img: '/images/about/certificate-5.svg', label: { en: 'AAA Credit Enterprise', zh: 'AAA 信用企业', ar: 'مؤسسة ائتمان AAA' } },
  { img: '/images/about/certificate-6.svg', label: { en: 'Utility Model Patent', zh: '实用新型专利', ar: 'براءة اختراع لنموذج منفعة' } },
];

/* ── Workshop photo gallery ── */
const WORKSHOP = [
  { img: '/images/about/factory-assembly.png', label: { en: 'Assembly Line', zh: '装配车间', ar: 'خط التجميع' } },
  { img: '/images/about/factory-rnd.png', label: { en: 'R&D Center', zh: '研发中心', ar: 'مركز البحث والتطوير' } },
  { img: '/images/about/factory-qc.png', label: { en: 'QC Testing', zh: '质检车间', ar: 'اختبار الجودة' } },
  { img: '/images/about/factory-warehouse.png', label: { en: 'Logistics Warehouse', zh: '物流仓储', ar: 'مستودع اللوجستيات' } },
];

/* ── Company timeline ── */
const TIMELINE: MilestoneItem[] = [
  {
    year: '2015',
    title: { en: 'Company Founded', zh: '公司成立', ar: 'تأسيس الشركة' },
    desc: {
      en: 'Qtech was founded in Guangzhou, initially producing advertising display screens before moving into smart vending.',
      zh: 'Qtech 于广州成立，最初从事广告屏制造，随后进军智能售货领域。',
      ar: 'تأسست Qtech في غوانغتشو، وبدأت بإنتاج شاشات العرض الإعلانية قبل التحول إلى آلات البيع الذكية.',
    },
  },
  {
    year: '2017',
    title: { en: 'Pivot to Custom Vending', zh: '转型售货定制', ar: 'التحول إلى آلات البيع المخصصة' },
    desc: {
      en: 'We shifted focus to customized vending machines, building our first flower and fresh-food units for overseas clients.',
      zh: '业务转型为定制售货机，为海外客户打造首批鲜花与鲜食售货设备。',
      ar: 'حولنا تركيزنا إلى آلات البيع المخصصة، وصنعنا أول وحدات للزهور والطعام الطازج لعملاء خارجيين.',
    },
  },
  {
    year: '2019',
    title: { en: 'Full-Scale Launch', zh: '全面启动', ar: 'الانطلاق على نطاق واسع' },
    desc: {
      en: 'Full-scale production launched across flower, pizza, coffee and cotton-candy vending lines.',
      zh: '鲜花、披萨、咖啡与棉花糖等多条售货机产线全面启动量产。',
      ar: 'انطلاق الإنتاج على نطاق واسع عبر خطوط بيع الزهور والبيتزا والقهوة والحلوى القطنية.',
    },
  },
  {
    year: '2020',
    title: { en: 'Focus on Niche Markets', zh: '专注细分市场', ar: 'التركيز على الأسواق المتخصصة' },
    desc: {
      en: 'We doubled down on niche segments — fruit & vegetable, flower, pizza and cotton-candy vending — becoming a specialist manufacturer.',
      zh: '聚焦水果蔬菜、鲜花、披萨与棉花糖等细分市场，成为专业化制造商。',
      ar: 'ركّزنا على قطاعات متخصصة — الفواكه والخضروات والزهور والبيتزا والحلوى القطنية — وأصبحنا مصنعًا متخصصًا.',
    },
  },
  {
    year: '2025',
    title: { en: '10th Anniversary · 60+ Countries', zh: '十周年 · 60+ 国家', ar: 'الذكرى العاشرة · 60+ دولة' },
    desc: {
      en: 'Celebrating our 10th anniversary, with Qtech vending machines now serving customers in 60+ countries worldwide.',
      zh: '迎来十周年，Qtech 售货机已服务全球 60+ 国家与地区的客户。',
      ar: 'نحتفل بمرور عقد على التأسيس، وباتت آلات Qtech تخدم العملاء في أكثر من 60 دولة حول العالم.',
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
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <RevealOnScroll key={s.key} delay={i * 80} className="h-full">
                  <div className="h-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:p-5">
                    <div className="flex items-center justify-center gap-2 text-cyan-200">
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName="bg-white/15 text-cyan-200 p-2" />
                    </div>
                    <dt className="mt-2 text-3xl font-extrabold">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </dt>
                    <dd className="mt-0.5 text-sm text-white/75">{t(s.key)}</dd>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ 1b. COMPANY INTRO ════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {locale === 'zh' ? '关于 Qtech' : locale === 'ar' ? 'عن Qtech' : 'About Qtech'}
            </p>
            <h2 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">
              {locale === 'zh' ? '创新科技，便捷服务' : locale === 'ar' ? 'تكنولوجيا مبتكرة، خدمة مريحة' : 'Innovative Tech, Convenient Service'}
            </h2>
            <div className="prose-qtech mt-4">
              {COMPANY_INTRO.body[locale].split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
                <p key={i} className="mb-4 leading-relaxed text-ink-600">{p}</p>
              ))}
            </div>
            <Link href={`/${locale}/contact`} className="btn-primary mt-6 px-7 py-3 text-sm">
              {t('nav.getQuote') || 'Get a Quote'} →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <img
              src={COMPANY_INTRO.image}
              alt="Qtech factory"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </RevealOnScroll>

      {/* ════════ 2. STORY SECTIONS (from DB) ════════ */}
      <div className="container-qtech space-y-16 py-16 lg:py-20">
        {sections.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          const SectionIcon = SECTION_ICONS[section.key] || Factory;
          return (
            <RevealOnScroll
              key={section.key}
              as="section"
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
                  <IconTile icon={SectionIcon} className="h-14 w-14" tileClassName="bg-white/15 text-white p-5" />
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
            </RevealOnScroll>
          );
        })}

        {/* ════════ 3. MANUFACTURING & QUALITY ════════ */}
        <RevealOnScroll as="section" className="overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-white lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
              <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-white/20 text-white p-1.5" />
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
            {MANU_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <RevealOnScroll key={localized(card.title, locale)} delay={i * 80} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
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
                        <IconTile icon={Icon} className="h-4 w-4" tileClassName="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-cyan-200" />
                        <h3 className="text-base font-semibold">{localized(card.title, locale)}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/80">{localized(card.desc, locale)}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 4. GLOBAL SUCCESS STORIES ════════ */}
        <RevealOnScroll as="section">
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
                <RevealOnScroll key={localized(s.title, locale)} delay={i * 80} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl pro-card">
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
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 5. CORE VALUES ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-brand-50/30 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {t('about.valuesEyebrow') || 'Our Values'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">{t('about.valuesTitle') || 'Our Values'}</h2>
            <p className="mt-2 text-ink-500">{t('about.valuesSubtitle') || 'What drives us forward every day.'}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <RevealOnScroll key={localized(v.title, locale)} delay={i * 80} className="h-full">
                  <div className="pro-card group relative flex h-full flex-col p-6 text-center">
                    {/* Oversized index watermark */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-2 select-none text-6xl font-black text-slate-100/50"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <IconTile
                      icon={Icon}
                      className="h-7 w-7"
                      tileClassName="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm transition group-hover:scale-110 group-hover:shadow-lg"
                    />
                    <h3 className="relative mt-4 text-lg font-bold text-ink-900">{localized(v.title, locale)}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{localized(v.desc, locale)}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 6. COMPANY TIMELINE ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-brand-900 px-8 py-14 text-white lg:px-12">
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
        </RevealOnScroll>

        {/* ════════ 7. CERTIFICATIONS ════════ */}
        <RevealOnScroll as="section">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {locale === 'zh' ? '资质认证' : locale === 'ar' ? 'شهادات الاعتماد' : 'Certifications & Compliance'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '国际标准，品质保证'
                : locale === 'ar' ? 'معايير دولية، ضمان الجودة'
                : 'International Standards, Guaranteed Quality'}
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CERTS.map((cert, i) => {
              const CertIcon = CERT_ICON[cert.icon] || ShieldCheck;
              return (
                <RevealOnScroll key={cert.name} delay={i * 60} className="h-full">
                  <div className="pro-card group flex h-full flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
                    <IconTile icon={CertIcon} className="h-8 w-8" tileClassName="text-brand-600" />
                    <span className="text-xs font-bold tracking-tight text-ink-900">{cert.name}</span>
                    <span className="hidden text-[11px] leading-snug text-ink-400 group-hover:block">
                      {cert.full[locale] || cert.full.en}
                    </span>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 7b. CERTIFICATE GALLERY ════════ */}
        <RevealOnScroll as="section">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {locale === 'zh' ? '证书展示' : locale === 'ar' ? 'معرض الشهادات' : 'Certificate Gallery'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '资质与荣誉' : locale === 'ar' ? 'الاعتمادات والتكريم' : 'Awards & Accreditations'}
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CERT_GALLERY.map((c, i) => (
              <RevealOnScroll key={c.img} delay={i * 60} className="h-full">
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={c.img}
                      alt={c.label[locale] || c.label.en}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
                      }}
                    />
                  </div>
                  <p className="px-4 py-3 text-center text-sm font-semibold text-ink-800">
                    {c.label[locale] || c.label.en}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>

        {/* ════════ 7c. WORKSHOP GALLERY ════════ */}
        <RevealOnScroll as="section">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {locale === 'zh' ? '工厂空间' : locale === 'ar' ? 'أروقة المصنع' : 'Inside the Workshop'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '从研发到交付的智造基地' : locale === 'ar' ? 'قاعدة التصنيع الذكي' : 'Our Smart Manufacturing Base'}
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKSHOP.map((w, i) => (
              <RevealOnScroll key={w.img} delay={i * 60} className="h-full">
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={w.img}
                      alt={w.label[locale] || w.label.en}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
                      }}
                    />
                  </div>
                  <p className="px-4 py-3 text-center text-sm font-semibold text-ink-800">
                    {w.label[locale] || w.label.en}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </RevealOnScroll>

        {/* ════════ 8. KEY NUMBERS ════════ */}
        <RevealOnScroll as="section" className="overflow-hidden rounded-3xl bg-brand-gradient px-8 py-12 text-center text-white">
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
        </RevealOnScroll>

        {/* ════════ 9. CTA ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-ink-900 px-8 py-14 text-center text-white">
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
        </RevealOnScroll>
      </div>
    </div>
  );
}
