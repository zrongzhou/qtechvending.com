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
  Store,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import type { Locale } from '@/lib/i18n';

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

interface StatementItem {
  icon: LucideIcon;
  title: Record<string, string>;
  desc: Record<string, string>;
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

/** Real photography replaces the old AI-generated placeholder webp files. */
const REAL_IMG: Record<string, string> = {
  story: '/images/about/real-workshop.png',
  mission: '/images/about/real-office.png',
  vision: '/images/about/real-building.png',
  capability: '/images/about/real-history.png',
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

/* ── Manufacturing process cards (real factory photography) ── */
const MANU_CARDS = [
  {
    img: '/images/about/real-workshop.png',
    icon: Factory,
    title: { en: 'Automated Assembly Line', zh: '自动化装配线', ar: 'خط التجميع الآلي' },
    desc: {
      en: 'Robotic arms & skilled technicians assemble every cabinet on our ISO-certified production line in Guangzhou.',
      zh: '在广州的 ISO 认证生产线上，由机械臂与熟练技师组装每一台设备。',
      ar: 'ذراعات آلية وفنيون ماهرون يجمعون كل خزانة على خط الإنتاج المعتمد من ISO في غوانغتشو.',
    },
    tags: {
      zh: ['ISO 9001 认证产线', '月产能 1000+ 台', '机械臂 + 熟练技工'],
      en: ['ISO 9001 certified line', '1000+ units / month', 'Robotic arms + skilled techs'],
      ar: ['خط معتمد ISO 9001', 'أكثر من 1000 وحدة/شهر', 'ذراع آلي + فنيون ماهرون'],
    },
  },
  {
    img: '/images/about/real-office.png',
    icon: Cog,
    title: { en: 'R&D & Innovation Center', zh: '研发与创新中心', ar: 'مركز البحث والتطوير والابتكار' },
    desc: {
      en: '20+ engineers drive continuous improvement in smart payment, IoT monitoring and energy-efficient cooling systems.',
      zh: '20+ 名工程师持续推进智能支付、IoT 监控和节能制冷系统的迭代升级。',
      ar: 'أكثر من 20 مهندسًا يقودون التحسين المستمر للدفع الذكي ومراقبة إنترنت الأشياء وأنظمة التبريد الموفرة للطاقة.',
    },
    tags: {
      zh: ['20+ 研发工程师', '智能支付与 IoT', '节能制冷系统'],
      en: ['20+ R&D engineers', 'Smart payment & IoT', 'Energy-saving cooling'],
      ar: ['أكثر من 20 مهندس تطوير', 'دفع ذكي وإنترنت الأشياء', 'تبريد موفر للطاقة'],
    },
  },
  {
    img: '/images/about/real-workshop.png',
    icon: ShieldCheck,
    title: { en: 'Strict QC Testing', zh: '严格质检体系', ar: 'نظام مراقبة الجودة الصارم' },
    desc: {
      en: 'Each unit undergoes 48-hour burn-in testing, drop test, and environmental simulation before leaving the factory.',
      zh: '每台设备在出厂前经过 48 小时老化测试、跌落试验和环境模拟测试。',
      ar: 'خضعت كل وحدة لاختبار الاحتراق لمدة 48 ساعة وسقوط ومحاكاة بيئية قبل مغادرة المصنع.',
    },
    tags: {
      zh: ['48 小时老化测试', '跌落与环境模拟', '出厂全检'],
      en: ['48-hour burn-in test', 'Drop & environment sim', '100% pre-ship inspection'],
      ar: ['اختبار احتراق 48 ساعة', 'محاكاة سقوط وبيئة', 'فحص كامل قبل الشحن'],
    },
  },
  {
    img: '/images/about/real-building.png',
    icon: Globe2,
    title: { en: 'Global Logistics Hub', zh: '全球物流枢纽', ar: 'مركز لوجستي عالمي' },
    desc: {
      en: 'Strategic warehouse near Guangzhou Port enables fast shipping to 60+ countries within 7–15 days.',
      zh: '广州港附近战略仓储，确保 7–15 天内发货至全球 60+ 国家和地区。',
      ar: 'مخزون استراتيجي بالقرب من ميناء غوانغتشو يتيح الشحن السريع إلى أكثر من 60 دولة خلال 7–15 يومًا.',
    },
    tags: {
      zh: ['广州港就近仓配', '7–15 天全球达', '60+ 国家覆盖'],
      en: ['Warehouse near Guangzhou Port', '7–15 days worldwide', '60+ countries covered'],
      ar: ['مستودع قرب ميناء غوانغتشو', '7–15 يومًا عالميًا', 'أكثر من 60 دولة'],
    },
  },
];

/* ── Mission statements (3 concrete commitments) ── */
const MISSION_STATEMENTS: StatementItem[] = [
  {
    icon: Target,
    title: { en: 'Profit for Operators', zh: '让设备成为利润中心', ar: 'ربحية للمشغلين' },
    desc: {
      en: 'Make every Qtech machine a profit center for operators — through reliable uptime and low running cost.',
      zh: '让每一台 Qtech 设备都成为运营商的利润中心——以稳定在线与低运营成本实现。',
      ar: 'اجعل كل آلة Qtech مركز ربح للمشغلين — عبر التشغيل المستقر وتكلفة التشغيل المنخفضة.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Industrial-Grade Quality', zh: '工业级品质', ar: 'جودة صناعية' },
    desc: {
      en: 'Redefine unattended retail with industrial-grade build quality and dependable components.',
      zh: '以工业级制造品质与可靠部件，重新定义无人零售。',
      ar: 'أعد تعريف البيع الذاتي بجودة بناء صناعية ومكونات موثوقة.',
    },
  },
  {
    icon: Sparkles,
    title: { en: 'Tech for Everyone', zh: '技术普惠', ar: 'تقنية للجميع' },
    desc: {
      en: 'Democratize smart vending — SMEs deserve the same intelligent solutions as large operators.',
      zh: '技术普惠——让中小企业也能拥有与大运营商同级的智能售货方案。',
      ar: 'إتاحة التقنية الذكية — للشركات الصغيرة نفس الحلول الذكية للمشغلين الكبار.',
    },
  },
];

/* ── Vision statements (3 aspirations) ── */
const VISION_STATEMENTS: StatementItem[] = [
  {
    icon: Globe2,
    title: { en: 'Most Trusted Partner', zh: '最值得信赖的伙伴', ar: 'الشريك الأكثر موثوقية' },
    desc: {
      en: 'Become the most trusted partner for intelligent self-service equipment worldwide.',
      zh: '成为全球运营商最信赖的智能自助设备伙伴。',
      ar: 'أن نكون الشريك الأكثر موثوقية لمعدات الخدمة الذاتية الذكية عالميًا.',
    },
  },
  {
    icon: Store,
    title: { en: 'Any Space, 24/7', zh: '任意空间即门店', ar: 'أي مكان نقطة بيع' },
    desc: {
      en: 'Turn any space into a 24/7 automated retail and service point.',
      zh: '把任意空间变成 24/7 的自动化零售与服务触点。',
      ar: 'حوّل أي مكان إلى نقطة بيع وخدمة آلية على مدار الساعة.',
    },
  },
  {
    icon: Leaf,
    title: { en: 'Sustainable by Design', zh: '绿色可持续', ar: 'استدامة بالتصميم' },
    desc: {
      en: 'Drive sustainable operations with green, energy-saving vending technology.',
      zh: '以绿色节能的售货技术，推动可持续运营。',
      ar: 'تشغيل مستدام بتقنية بيع خضراء موفرة للطاقة.',
    },
  },
];

/* ── Global success stories (real deployments) ── */
const STORIES = [
  {
    image: '/images/cases/flower-vending-feedback.webp',
    title: { en: 'Subway Fresh-Flower Kiosk', zh: '地铁鲜花自助柜', ar: 'كشك الزهور الطازجة في المترو' },
    sub: {
      en: 'Deployed across metro stations in Southeast Asia.',
      zh: '已落地东南亚多个地铁站。',
      ar: 'تم نشره في محطات المترو في جنوب شرق آسيا.',
    },
  },
  {
    image: '/images/cases/feedback.webp',
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: 'بيتزا الحرم الجامعي 24/7' },
    sub: {
      en: 'Serving students late-night on a European campus.',
      zh: '为欧洲校园师生提供深夜热食。',
      ar: 'تقديم الطعام الساخن لطلاب الحرم الجامعي في وقت متأخر.',
    },
  },
  {
    image: '/images/cases/ice-cream-vending.webp',
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'روبوت آيس كريم بتصميم العلامة التجارية' },
    sub: {
      en: 'OEM branding for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制。',
      ar: 'تخصيص OEM لسلسلة بيع بالتجزئة في الشرق الأوسط.',
    },
  },
  {
    image: '/images/cases/feedback-video-1.webp',
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'مكتب قهوة المكاتب' },
    sub: {
      en: 'Energy-saving coffee in corporate lobbies.',
      zh: '企业大堂的节能咖啡方案。',
      ar: 'قهوة موفرة للطاقة في بهو الشركات.',
    },
  },
  {
    image: '/images/cases/feedback-in-hospital.webp',
    title: { en: 'Juice Bar, Zero Staff', zh: '无人鲜榨果汁吧', ar: 'مفهوم عصير بلا موظفين' },
    sub: {
      en: 'Fresh juice vending in a beachside resort.',
      zh: '海滨度假村的鲜榨果汁售货。',
      ar: 'بيع عصير طازج في منتجع على الشاطئ.',
    },
  },
  {
    image: '/images/cases/pet-wash-demo.webp',
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

/* ── Company intro (enriched, story-driven copy) ── */
const COMPANY_INTRO: { body: Record<string, string>; image: string } = {
  image: '/images/about/real-building.png',
  body: {
    en: "Founded in Guangzhou in 2015 as Qiuyan (Qtech) Technology, we began with advertising display screens before pivoting to smart vending. Over the past decade we've grown into a specialist manufacturer of intelligent self-service equipment.\n\nFrom our Guangzhou production base we design and build fresh-flower, food, beverage and specialty vending machines — combining in-house R&D, strict QC and global logistics into every unit.\n\nToday Qtech machines run in 60+ countries across six continents, backed by a 2-year warranty and lifetime maintenance. And we're only getting started.",
    zh: 'Qtech（秋彦科技）2015 年成立于广州，最初从事广告屏制造，随后转型智能售货领域。十年间，我们已成长为专业的智能自助设备制造商。\n\n依托广州生产基地，我们自主研发并制造鲜花、食品、饮品与特种售货机，将研发实力、严格质检与全球物流融为一体。\n\n如今，Qtech 设备已服务于六大洲 60+ 国家和地区，并承诺两年质保与终身维护。我们的故事，才刚刚开始。',
    ar: 'تأسست Qtech (تشيويان للتكنولوجيا) في غوانغتشو عام 2015، وبدأت بإنتاج شاشات العرض الإعلانية قبل التحول إلى آلات البيع الذكية. وعبر العقد الماضي أصبحنا مصنعًا متخصصًا في معدات الخدمة الذاتية الذكية.\n\nمن قاعدة إنتاجنا في غوانغتشو نصمم ونبني آلات بيع الزهور والطعام والمشروبات والمتخصصة — نجمع بين البحث والتطوير الداخلي ومراقبة الجودة واللوجستيات العالمية في كل وحدة.\n\nاليوم تعمل آلات Qtech في أكثر من 60 دولة عبر ست قارات، مدعومة بضمان لمدة عامين وصيانة مدى الحياة. وما زلنا في البداية فقط.',
  },
};

/* ── Certifications are represented by the icon badge grid in section 9
   (CERTS). The old CERT_GALLERY photo strip and WORKSHOP photo gallery were
   removed in V33 to avoid repeating the same factory/office photos that
   already appear in the Story, Company-Intro and Manufacturing sections. ── */

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

/** Subtle ocean wave divider between major sections. */
function WaveDivider() {
  return (
    <div className="relative h-10 w-full overflow-hidden text-ocean-100/70" aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  // Only the narrative story / capability blocks use the DB copy; Mission &
  // Vision are presented as dedicated 3-statement sections below.
  const narrative = sections.filter((s) => s.key === 'story' || s.key === 'capability');

  const localeOr = <T extends string>(rec: Record<string, T>): T => (rec[locale] as T) ?? (rec.en as T);

  return (
    <div className="bg-gradient-to-b from-ocean-50/70 via-white to-brand-50/40">
      {/* ════════ 1. HERO ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-50 to-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -start-16 top-10 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute end-0 top-1/3 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" aria-hidden="true" />

        <div className="container-qtech relative py-16 text-center lg:py-24">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            {t('about.badge') || 'About Qtech'}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">{t('about.title')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-600">{t('about.subtitle')}</p>

          {/* Stat band under hero */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <RevealOnScroll key={s.key} delay={i * 80} className="h-full">
                  <div className="flex h-full flex-col ocean-glass ocean-glass--sm bg-white/95 p-4 shadow-ocean lg:p-5">
                    <div className="flex items-center justify-center gap-2 text-brand-700">
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName="bg-brand-100 text-brand-700 p-2" />
                    </div>
                    <dt className="mt-2 text-3xl font-extrabold text-ink-900">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink-600">{t(s.key)}</dd>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ 1b. COMPANY INTRO ════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-ocean-50/70 via-white to-brand-50/40 px-8 py-14 shadow-soft lg:grid-cols-2 lg:px-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {locale === 'zh' ? '关于 Qtech' : locale === 'ar' ? 'عن Qtech' : 'About Qtech'}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {locale === 'zh' ? '创新科技，便捷服务' : locale === 'ar' ? 'تكنولوجيا مبتكرة، خدمة مريحة' : 'Innovative Tech, Convenient Service'}
            </h2>
            <div className="prose-qtech mt-4">
              {COMPANY_INTRO.body[locale].split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
                <p key={i} className="mb-4 leading-relaxed text-ink-600">{p}</p>
              ))}
            </div>
            <Link href={`/${locale}/contact`} className="btn-primary mt-6">
              {t('nav.getQuote') || 'Get a Quote'}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ocean-200/60 shadow-ocean">
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

      <WaveDivider />

      {/* ════════ 2. MISSION (3 statements) ════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            <IconTile icon={Target} className="h-4 w-4" tileClassName="bg-brand-200 text-brand-700 p-1.5" />
            {locale === 'zh' ? '我们的使命' : locale === 'ar' ? 'مهمتنا' : 'Our Mission'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '让智能自助真正创造价值' : locale === 'ar' ? 'جعل الخدمة الذاتية تخلق قيمة حقيقية' : 'Making Self-Service Create Real Value'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MISSION_STATEMENTS.map((m, i) => {
            const Icon = m.icon;
            return (
              <RevealOnScroll key={localeOr(m.title)} delay={i * 80} className="h-full">
                <OceanGlassCard depth="md" hoverLift className="group relative h-full border border-ocean-200/60">
                  <div className="flex h-full flex-col p-6">
                    <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" aria-hidden="true" />
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-brand-600 text-white shadow-ocean transition-transform duration-300 group-hover:scale-110"
                    />
                    <h3 className="mt-4 text-lg font-bold text-ink-900">{localeOr(m.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(m.desc)}</p>
                  </div>
                </OceanGlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      <WaveDivider />

      {/* ════════ 3. VISION (3 statements) ════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
            <IconTile icon={Eye} className="h-4 w-4" tileClassName="bg-brand-200 text-brand-700 p-1.5" />
            {locale === 'zh' ? '我们的愿景' : locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '让世界随处可享智能服务' : locale === 'ar' ? 'لنجعل الخدمة الذكية في كل مكان' : 'Smart Service, Everywhere'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VISION_STATEMENTS.map((v, i) => {
            const Icon = v.icon;
            return (
              <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                <OceanGlassCard depth="md" hoverLift className="group relative h-full border border-ocean-200/60">
                  <div className="flex h-full flex-col p-6">
                    <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" aria-hidden="true" />
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-brand-600 text-white shadow-ocean transition-transform duration-300 group-hover:scale-110"
                    />
                    <h3 className="mt-4 text-lg font-bold text-ink-900">{localeOr(v.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(v.desc)}</p>
                  </div>
                </OceanGlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      <WaveDivider />

      {/* ════════ 4. STORY / CAPABILITY NARRATIVE (from DB) ════════ */}
      <div className="container-qtech space-y-16 py-16 lg:py-24">
        {narrative.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          const SectionIcon = SECTION_ICONS[section.key] || Factory;
          const img = REAL_IMG[section.key] || section.image || REAL_IMG.story;
          return (
            <RevealOnScroll
              key={section.key}
              as="section"
              className={`grid items-center gap-10 lg:grid-cols-2 ${
                idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ocean-200/60 shadow-ocean">
                <img
                  src={img}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </RevealOnScroll>
          );
        })}

        {/* ════════ 5. MANUFACTURING & QUALITY ════════ */}
        <RevealOnScroll as="section" className="overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-50 to-brand-50 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-brand-200 text-brand-700 p-1.5" />
              {locale === 'zh' ? '智造实力' : locale === 'ar' ? 'قدرات التصنيع' : 'Manufacturing Capability'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '从研发到交付的全链路品质保障'
                : locale === 'ar' ? 'ضمان الجودة من البحث حتى التسليم'
                : 'End-to-End Quality from R&D to Delivery'}
            </h2>
            <p className="mt-3 text-ink-600">
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
              const tags = card.tags[locale] ?? card.tags.en;
              return (
                <RevealOnScroll key={localeOr(card.title)} delay={i * 80} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl ocean-glass ocean-glass--sm bg-white/95">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={card.img}
                        alt={localeOr(card.title)}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-3">
                        <IconTile icon={Icon} className="h-4 w-4" tileClassName="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700" />
                        <h3 className="text-base font-semibold text-ink-900">{localeOr(card.title)}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(card.desc)}</p>
                      {/* Capability tags — ocean-glass chips */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-ocean-200/70 bg-ocean-50/70 px-2.5 py-1 text-[11px] font-medium text-ocean-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 6. GLOBAL SUCCESS STORIES ════════ */}
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
                <RevealOnScroll key={localeOr(s.title)} delay={i * 80} className="h-full">
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl pro-card ocean-glass ocean-glass--sm">
                    {/* Persistent brand-500 top accent bar — card memory point */}
                    <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
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

        {/* ════════ 7. CORE VALUES ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-ocean-50/70 via-white to-brand-50/40 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              {t('about.valuesEyebrow') || 'Our Values'}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">{t('about.valuesTitle') || 'Our Values'}</h2>
            <p className="mt-2 text-ink-500">{t('about.valuesSubtitle') || 'What drives us forward every day.'}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                  <div className="pro-card group relative flex h-full flex-col p-6 text-center ocean-glass ocean-glass--sm">
                    {/* Persistent brand-500 top accent bar — card memory point */}
                    <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
                    {/* Oversized index watermark */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -end-2 -top-2 select-none text-6xl font-black text-slate-100/50"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <IconTile
                      icon={Icon}
                      className="h-7 w-7"
                      tileClassName="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm transition group-hover:scale-110 group-hover:shadow-lg"
                    />
                    <h3 className="relative mt-4 text-lg font-bold text-ink-900">{localeOr(v.title)}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{localeOr(v.desc)}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 8. COMPANY TIMELINE ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-ocean-50/60 via-white to-brand-50/30 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
              {locale === 'zh' ? '发展历程' : locale === 'ar' ? 'رحلتنا الزمنية' : 'Our Journey'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '十年深耕，从广州走向世界'
                : locale === 'ar' ? 'عقد من الخبرة: من غوانغتشو إلى العالم'
                : 'A Decade of Excellence, From Guangzhou to the World'}
            </h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-3xl">
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 start-[19px] hidden w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-rose-200 md:block translate-x-1/2" />

            <div className="space-y-8">
              {TIMELINE.map((m) => (
              <div key={m.year} className="relative flex gap-5 ps-0 md:ps-14">
                {/* Dot marker — orange/rose to match the warm accent system */}
                <div className="absolute start-0 top-1 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-[10px] font-bold text-white shadow-lg shadow-orange-500/30 ring-4 ring-slate-50 md:start-0">
                  {m.year.slice(-2)}
                </div>
                <div className="pro-card flex-1 rounded-xl p-6 ocean-glass ocean-glass--sm">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-base font-extrabold tracking-tight text-orange-600">{m.year}</span>
                    <h3 className="text-base font-bold text-ink-900">{localeOr(m.title)}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(m.desc)}</p>
                </div>
              </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* ════════ 9. CERTIFICATIONS ════════ */}
        <RevealOnScroll as="section">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
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
                  <div className="pro-card group relative flex h-full flex-col items-center gap-2 p-5 text-center transition hover:border-brand-200 hover:shadow-lift ocean-glass ocean-glass--sm">
                    <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
                    <IconTile icon={CertIcon} className="h-8 w-8" tileClassName="text-brand-700" />
                    <span className="text-xs font-bold tracking-tight text-ink-900">{cert.name}</span>
                    <span className="hidden text-[11px] leading-snug text-ink-500 group-hover:block">
                      {cert.full[locale] || cert.full.en}
                    </span>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 10. KEY NUMBERS ════════ */}
        <RevealOnScroll as="section" className="overflow-hidden rounded-3xl bg-ocean-50 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t('about.statsTitle') || 'Qtech by Numbers'}</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {NUMBERS.map((n) => (
              <div key={localeOr(n.label)}>
                <dt className="text-4xl font-extrabold text-ink-900">
                  <CountUp end={n.end} suffix={n.suffix} />
                </dt>
                <dd className="mt-2 text-sm text-ink-600">{localeOr(n.label)}</dd>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* ════════ 11. CTA ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-ocean-50 to-brand-50 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold text-ink-900">{t('about.cta') || 'Ready to Partner with Qtech?'}</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            {locale === 'zh'
              ? '联系我们获取定制报价与技术方案。'
              : locale === 'ar'
                ? 'تواصل معنا للحصول على عرض سعر مخصص وحلول تقنية.'
                : 'Contact us for custom quotes and technical solutions.'}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="btn-primary mt-8"
          >
            {t('nav.getQuote') || 'Get a Quote'}
          </Link>
        </RevealOnScroll>
      </div>
    </div>
  );
}
