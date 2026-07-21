'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  BadgeCheck,
  BadgeDollarSign,
  Banknote,
  BarChart3,
  Clock,
  Cog,
  Cpu,
  Factory,
  Globe2,
  Headphones,
  Leaf,
  Lightbulb,
  Package,
  Palette,
  PenTool,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  ArrowUpCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import type { Locale } from '@/lib/i18n';
import CaseGallerySection from '@/components/home/CaseGallerySection';
import FactoryShowcase from '@/components/about/FactoryShowcase';

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
  Cpu,
  Microscope: ShieldCheck,
  Award: BadgeCheck,
};

/** Icon mapping — used for narrative sections (no photos). */
const SECTION_ICONS: Record<string, LucideIcon> = {
  story: Factory,
  mission: Target,
  vision: Globe2,
  capability: Cog,
};

/* ── Six company strengths ── */
const STRENGTHS: ValueItem[] = [
  {
    icon: Palette,
    title: { en: 'Creative Design', zh: '创意设计', ar: 'تصميم إبداعي' },
    desc: {
      en: 'Our designs are always fresh and keep up with the latest trends, giving every machine a distinctive, market-ready look.',
      zh: '设计始终新颖、紧跟潮流，让每台设备都拥有独特且契合市场的外观。',
      ar: 'تصاميمنا دائمًا حديثة وتواكب الاتجاهات، مما يمنح كل آلة مظهرًا مميزًا وجاهزًا للسوق.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Premium Materials', zh: '优质材料', ar: 'مواد ممتازة' },
    desc: {
      en: 'We use the best-grade components so machines last through years of daily operation.',
      zh: '采用最优等级零部件制造，确保设备在长年日常运营中经久耐用。',
      ar: 'نستخدم أفضل المكونات لتبقى الآلات صامدة عبر سنوات من التشغيل اليومي.',
    },
  },
  {
    icon: Cpu,
    title: { en: 'Smart Management', zh: '智能管理', ar: 'إدارة ذكية' },
    desc: {
      en: 'Our machines are smart with systems for remote control and monitoring, letting operators manage fleets from anywhere.',
      zh: '远程控制与监控系统让运营者随时随地管理设备集群。',
      ar: 'آلاتنا ذكية مع أنظمة للتحكم والمراقبة عن بُعد، مما يتيح للمشغلين إدارة الأساطيل من أي مكان.',
    },
  },
  {
    icon: BadgeDollarSign,
    title: { en: 'Affordable Quality', zh: '高性价比', ar: 'جودة بأسعار معقولة' },
    desc: {
      en: 'We find ways to keep costs down without sacrificing quality, so you get lasting value.',
      zh: '在控制成本的同时绝不牺牲制造品质，为客户带来持久价值。',
      ar: 'نوفر السيولة مع الحفاظ على الجودة، لتقديم قيمة دائمة لعملائنا.',
    },
  },
  {
    icon: Headphones,
    title: { en: 'All-Round Service', zh: '全程服务', ar: 'خدمة شاملة' },
    desc: {
      en: "We're there for you with advice and support from first inquiry to after-sales service.",
      zh: '从首次咨询到售后服务，提供全程专业建议与支持。',
      ar: 'نقدم الاستشارات والدعم من أول استفسار حتى ما بعد البيع.',
    },
  },
  {
    icon: ArrowUpCircle,
    title: { en: 'Continuous Improvement', zh: '持续改进', ar: 'تحسين مستمر' },
    desc: {
      en: 'We keep working on our machines to make them even better, release after release.',
      zh: '在每一代产品中持续打磨，让设备越来越出色。',
      ar: 'نواصل تحسين آلاتنا إصدارًا بعد إصدار لتصبح أفضل.',
    },
  },
];

/* ── Company advantages (7) — V48 R7 ── */
const COMPANY_ADVANTAGES: ValueItem[] = [
  {
    icon: PenTool,
    title: { en: 'Vending Machine Design', zh: '售货机设计', ar: 'تصميم آلات البيع' },
    desc: {
      en: 'Our vending machines feature innovative and attractive designs, all of which are protected by design patents to ensure your equipment stands out in the market.',
      zh: '我们的售货机拥有创新且吸睛的设计，全部受外观设计专利保护，让您的设备在市场中脱颖而出。',
      ar: 'تتميز آلات البيع الخاصة بنا بتصاميم مبتكرة وجذابة، جميعها محمية ببراءات تصميم لضمان تميز معداتك في السوق.',
    },
  },
  {
    icon: Banknote,
    title: { en: 'Competitive Pricing', zh: '极具竞争力的价格', ar: 'أسعار تنافسية' },
    desc: {
      en: 'With a self-manufacturing and direct sales model, coupled with 10 years of manufacturing experience, we ensure cost-effective solutions.',
      zh: '依托自主生产与直销模式，加上十年制造经验，我们提供高性价比的解决方案。',
      ar: 'بفضل نموذج التصنيع الذاتي والمبيعات المباشرة، جنبًا إلى عشر سنوات من الخبرة، نضمن حلولًا فعالة التكلفة.',
    },
  },
  {
    icon: Users,
    title: { en: 'Professional Team', zh: '专业团队', ar: 'فريق محترف' },
    desc: {
      en: 'Our team offers professional consultation before purchase and training after sales to ensure you receive the best support from purchase to use.',
      zh: '我们的团队在售前提供专业咨询，售后提供培训，确保您从选购到使用都获得最佳支持。',
      ar: 'يقدم فريقنا استشارات احترافية قبل الشراء وتدريبًا بعد البيع لضمان حصولك على أفضل دعم من الشراء حتى الاستخدام.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Quality Assurance', zh: '品质保证', ar: 'ضمان الجودة' },
    desc: {
      en: 'We implement strict quality control processes and provide a 2-year warranty, giving you peace of mind with your purchase.',
      zh: '我们执行严格的质量控制流程，并提供两年质保，让您购买无忧。',
      ar: 'نتّبع عمليات مراقبة جودة صارمة ونقدم ضمانًا لمدة عامين لراحة بالك عند الشراء.',
    },
  },
  {
    icon: BadgeCheck,
    title: { en: 'International Certifications', zh: '国际认证', ar: 'شهادات دولية' },
    desc: {
      en: 'Our products have passed multiple international certifications, including ISO and CE, ensuring product quality and safety.',
      zh: '我们的产品已通过 ISO、CE 等多项国际认证，确保品质与安全。',
      ar: 'اجتازت منتجاتنا شهادات دولية متعددة بما في ذلك ISO وCE، مما يضمن الجودة والسلامة.',
    },
  },
  {
    icon: SlidersHorizontal,
    title: { en: 'Customization', zh: '定制服务', ar: 'التخصيص' },
    desc: {
      en: 'We offer customization services to meet your individual needs, allowing your vending machine to better fit your business requirements.',
      zh: '我们提供定制服务以满足您的个性化需求，让售货机更贴合您的业务场景。',
      ar: 'نقدم خدمات التخصيص لتلبية احتياجاتك الفردية، مما يتيح لآلة البيع الخاصة بك أن تناسب متطلبات عملك بشكل أفضل.',
    },
  },
  {
    icon: Target,
    title: { en: 'Company Vision and Mission', zh: '企业愿景与使命', ar: 'رؤية الشركة ورسالتها' },
    desc: {
      en: 'Our vision is to provide professional services and high-quality products to help you earn from machine operations, achieving a win-win situation.',
      zh: '我们的愿景是提供专业服务与高品质产品，助您通过设备运营获利，实现共赢。',
      ar: 'رؤيتنا هي تقديم خدمات احترافية ومنتجات عالية الجودة لمساعدتك على تحقيق أرباح من تشغيل الآلات وتحقيق موقف مربح للطرفين.',
    },
  },
];

/* ── Core values (8-grid) ── */
const VALUES: ValueItem[] = [
  {
    icon: Lightbulb,
    title: { en: 'Creative Design', zh: '创意设计', ar: 'تصميم إبداعي' },
    desc: {
      en: 'Fresh, trend-forward designs that make every machine stand out in any location.',
      zh: '新颖、紧跟潮流的设计，让每台设备在任何场景都脱颖而出。',
      ar: 'تصاميم حديثة ومتقدمة تجعل كل آلة تبرز في أي موقع.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Premium Materials', zh: '优质材料', ar: 'مواد ممتازة' },
    desc: {
      en: 'Top-grade components chosen for durability and long-term operation.',
      zh: '精选高等级零部件，确保耐用与长期稳定运行。',
      ar: 'مكونات عالية الجودة مختارة للمتانة والتشغيل طويل الأمد.',
    },
  },
  {
    icon: BarChart3,
    title: { en: 'Smart Management', zh: '智能管理', ar: 'إدارة ذكية' },
    desc: {
      en: 'Remote monitoring and control systems that keep your fleet running efficiently.',
      zh: '远程监控与控制系统，让设备集群高效运转。',
      ar: 'أنظمة مراقبة وتحكم عن بُعد تبقي أسطولك يعمل بكفاءة.',
    },
  },
  {
    icon: TrendingUp,
    title: { en: 'Affordable Quality', zh: '高性价比', ar: 'جودة بأسعار معقولة' },
    desc: {
      en: 'Smart engineering and vertical integration that keep costs down without cutting corners.',
      zh: '通过智能工程与垂直整合，在不牺牲品质的前提下控制成本。',
      ar: 'هندسة ذكية وتكامل رأسي يخفضان التكاليف دون المساس بالجودة.',
    },
  },
  {
    icon: Headphones,
    title: { en: 'All-Round Service', zh: '全程服务', ar: 'خدمة شاملة' },
    desc: {
      en: 'Support in English, Chinese and Arabic from inquiry through installation and beyond.',
      zh: '从咨询、安装到售后，提供中英文与阿拉伯语全程支持。',
      ar: 'دعم بالإنجليزية والصينية والعربية من الاستفسار حتى التركيب وما بعده.',
    },
  },
  {
    icon: RefreshCw,
    title: { en: 'Continuous Improvement', zh: '持续改进', ar: 'تحسين مستمر' },
    desc: {
      en: 'Every product generation refines performance, reliability and user experience.',
      zh: '每一代产品都在性能、可靠性与体验上持续精进。',
      ar: 'يتم تحسين الأداء والموثوقية وتجربة المستخدم في كل جيل من المنتجات.',
    },
  },
  {
    icon: BadgeCheck,
    title: { en: 'Quality Assurance', zh: '品质保证', ar: 'ضمان الجودة' },
    desc: {
      en: 'Strict QC, burn-in testing and a 2-year warranty back every machine.',
      zh: '严格质检、老化测试与两年保修，为每一台设备保驾护航。',
      ar: 'رقابة جودة صارمة واختبار الاحتراق وضمان لمدة عامين لكل آلة.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'International Certifications', zh: '国际认证', ar: 'شهادات دولية' },
    desc: {
      en: 'Built to ISO and CE standards for smooth global compliance.',
      zh: '按 ISO 与 CE 标准制造，满足全球合规要求。',
      ar: 'تُصنع وفق معايير ISO وCE لامتثال عالمي سلس.',
    },
  },
];

/* ── Key facts (reference data) ── */
const NUMBERS: NumberItem[] = [
  { end: 11, suffix: '+', label: { en: 'Product categories', zh: '产品品类', ar: 'فئات المنتجات' } },
  { end: 60, suffix: '+', label: { en: 'Countries served', zh: '服务国家', ar: 'دول نخدمها' } },
  { end: 500, suffix: '+', label: { en: 'Global partners', zh: '全球合作伙伴', ar: 'شركاء عالميون' } },
  { end: 24, suffix: '/7', label: { en: 'Self-service operation', zh: '无人自助运营', ar: 'تشغيل ذاتي' } },
];

/* ── Manufacturing process cards ── */
const MANU_CARDS = [
  {
    icon: Factory,
    title: { en: 'Automated Assembly Line', zh: '自动化装配线', ar: 'خط التجميع الآلي' },
    desc: {
      en: 'Robotic arms and skilled technicians assemble every cabinet on our ISO-certified production line in Guangzhou.',
      zh: '在广州的 ISO 认证生产线上，由机械臂与熟练技师组装每一台设备。',
      ar: 'تجمع ذراعات آلية وفنيون ماهرون كل خزانة على خط الإنتاج المعتمد من ISO في غوانغتشو.',
    },
    tags: {
      zh: ['ISO 9001 认证产线', '月产能 1000+ 台', '机械臂 + 熟练技工'],
      en: ['ISO 9001 certified line', '1000+ units / month', 'Robotic arms + skilled techs'],
      ar: ['خط معتمد ISO 9001', 'أكثر من 1000 وحدة/شهر', 'ذراع آلي + فنيون ماهرون'],
    },
  },
  {
    icon: Cog,
    title: { en: 'R&D & Innovation Center', zh: '研发与创新中心', ar: 'مركز البحث والتطوير والابتكار' },
    desc: {
      en: '20+ engineers drive continuous improvement in smart payment, IoT monitoring and energy-efficient cooling systems.',
      zh: '20+ 名工程师持续推进智能支付、IoT 监控和节能制冷系统的迭代升级。',
      ar: 'أكثر من 20 مهندسًا يقودون التحسين المستمر في الدفع الذكي ومراقبة إنترنت الأشياء وأنظمة التبريد الموفرة للطاقة.',
    },
    tags: {
      zh: ['20+ 研发工程师', '智能支付与 IoT', '节能制冷系统'],
      en: ['20+ R&D engineers', 'Smart payment & IoT', 'Energy-saving cooling'],
      ar: ['أكثر من 20 مهندس تطوير', 'دفع ذكي وإنترنت الأشياء', 'تبريد موفر للطاقة'],
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Strict QC Testing', zh: '严格质检体系', ar: 'نظام مراقبة الجودة الصارم' },
    desc: {
      en: 'Each unit undergoes 48-hour burn-in testing, drop test and environmental simulation before leaving the factory.',
      zh: '每台设备在出厂前经过 48 小时老化测试、跌落试验和环境模拟测试。',
      ar: 'تخضع كل وحدة لاختبار الاحتراق لمدة 48 ساعة وسقوط ومحاكاة بيئية قبل مغادرة المصنع.',
    },
    tags: {
      zh: ['48 小时老化测试', '跌落与环境模拟', '出厂全检'],
      en: ['48-hour burn-in test', 'Drop & environment sim', '100% pre-ship inspection'],
      ar: ['اختبار احتراق 48 ساعة', 'محاكاة سقوط وبيئة', 'فحص كامل قبل الشحن'],
    },
  },
  {
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

/* ── Mission statements ── */
const MISSION_STATEMENTS: StatementItem[] = [
  {
    icon: Target,
    title: { en: 'Profit for Operators', zh: '让设备成为利润中心', ar: 'ربحية للمشغلين' },
    desc: {
      en: 'Make every Qtech machine a reliable profit center for operators. Through stable uptime, low running costs and smart inventory management, we help partners turn any location into a revenue stream.',
      zh: '让每一台 Qtech 设备都成为运营商可靠的利润中心。通过稳定在线、低运营成本与智能库存管理，帮助合作伙伴把任何地点变成收入来源。',
      ar: 'اجعل كل آلة Qtech مركز ربح موثوق للمشغلين. عبر التشغيل المستقر وتكلفة التشغيل المنخفضة وإدارة المخزون الذكية، نساعد الشركاء على تحويل أي موقع إلى مصدر دخل.',
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Industrial-Grade Quality', zh: '工业级品质', ar: 'جودة صناعية' },
    desc: {
      en: 'Redefine unattended retail with industrial-grade build quality and dependable components. Every weld, board and sensor is tested so machines keep working in real-world conditions.',
      zh: '以工业级制造品质与可靠部件重新定义无人零售。每一道焊接、每一块电路板、每一个传感器都经过测试，确保设备在真实环境中持续运行。',
      ar: 'أعد تعريف البيع الذاتي بجودة بناء صناعية ومكونات موثوقة. كل لحام ولوحة وحساس يتم اختباره لضمان عمل الآلات في الظروف الحقيقية.',
    },
  },
  {
    icon: Sparkles,
    title: { en: 'Tech for Everyone', zh: '技术普惠', ar: 'تقنية للجميع' },
    desc: {
      en: 'Democratize smart vending. SMEs deserve the same intelligent payment, remote monitoring and data analytics as large operators, without enterprise-level budgets or complexity.',
      zh: '技术普惠——让中小企业也能拥有与大运营商同级的智能支付、远程监控与数据分析能力，无需企业级预算与复杂度。',
      ar: 'إتاحة التقنية الذكية للجميع. الشركات الصغيرة تستحق نفس الدفع الذكي والمراقبة عن بُعد وتحليل البيانات التي يستخدمها المشغلون الكبار، دون ميزانيات أو تعقيدات على مستوى المؤسسات.',
    },
  },
];

/* ── Vision statements ── */
const VISION_STATEMENTS: StatementItem[] = [
  {
    icon: Globe2,
    title: { en: 'Most Trusted Partner', zh: '最值得信赖的伙伴', ar: 'الشريك الأكثر موثوقية' },
    desc: {
      en: 'Become the most trusted partner for intelligent self-service equipment worldwide. We build relationships that last longer than the machines themselves, with honest service and transparent support.',
      zh: '成为全球智能自助设备领域最值得信赖的伙伴。我们建立比设备本身更长久的关系，以真诚服务与透明支持赢得客户。',
      ar: 'أن نكون الشريك الأكثر موثوقية لمعدات الخدمة الذاتية الذكية عالميًا. نبني علاقات تدوم أطول من الآلات نفسها، مع خدمة صادقة ودعم شفاف.',
    },
  },
  {
    icon: Store,
    title: { en: 'Any Space, 24/7', zh: '任意空间即门店', ar: 'أي مكان نقطة بيع' },
    desc: {
      en: 'Turn any space into a 24/7 automated retail and service point. From offices and campuses to transit hubs and resorts, Qtech machines make service available whenever customers need it.',
      zh: '把任意空间变成 24/7 的自动化零售与服务触点。从办公室、校园到交通枢纽与度假村，Qtech 设备让客户随时获得服务。',
      ar: 'حوّل أي مكان إلى نقطة بيع وخدمة آلية على مدار الساعة. من المكاتس والحرم الجامعي إلى محاور النقل والمنتجعات، تجعل آلات Qtech الخدمة متاحة وقتما يحتاجها العملاء.',
    },
  },
  {
    icon: Leaf,
    title: { en: 'Sustainable by Design', zh: '绿色可持续', ar: 'استدامة بالتصميم' },
    desc: {
      en: 'Drive sustainable operations with green, energy-saving vending technology. Lower power consumption, smarter refrigeration and durable materials reduce environmental impact across the product lifecycle.',
      zh: '以绿色节能的售货技术推动可持续运营。更低的功耗、更智能的制冷与更耐用的材料，降低产品全生命周期的环境影响。',
      ar: 'تشغيل مستدام بتقنية بيع خضراء موفرة للطاقة. تقليل استهلاك الطاقة والتبريد الأكثر ذكاءً والمواد المتينة تقلل التأثير البيئي على مدى دورة حياة المنتج.',
    },
  },
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
  { name: 'FCC', icon: 'Cpu', full: { en: 'FCC Approved', zh: 'FCC 认证', ar: 'معتمد FCC' } },
  { name: 'SGS', icon: 'Microscope', full: { en: 'SGS Tested', zh: 'SGS 检测认证', ar: 'تم اختباره بواسطة SGS' } },
  { name: 'Patents 20+', icon: 'Award', full: { en: '20+ Patents', zh: '20+ 项专利', ar: 'أكثر من 20 براءة اختراع' } },
];

/* ── Hero stat cards ── */
const HERO_STATS = [
  { end: 11, suffix: '+', icon: Factory, key: 'hero.statCategories' },
  { end: 60, suffix: '+', icon: Globe2, key: 'hero.statCountries' },
  { end: 500, suffix: '+', icon: Users, key: 'hero.statPartners' },
  { end: 24, suffix: '/7', icon: Clock, key: 'hero.statService' },
];

/* ── Global impact data wall ── */
const IMPACT = [
  { icon: Globe2, value: '80+', label: { en: 'Countries served', zh: '服务国家', ar: 'دول نخدمها' }, accent: 0 },
  { icon: Users, value: '500+', label: { en: 'Global partners', zh: '全球合作伙伴', ar: 'شركاء عالميون' }, accent: 1 },
  { icon: Package, value: '22+', label: { en: 'Machine models', zh: '机型种类', ar: 'طرازات الآلات' }, accent: 2 },
  { icon: Clock, value: '24/7', label: { en: 'Always-on support', zh: '全天候支持', ar: 'دعم على مدار الساعة' }, accent: 3 },
  { icon: TrendingUp, value: '98%', label: { en: 'Client satisfaction', zh: '客户满意度', ar: 'رضا العملاء' }, accent: 0 },
  { icon: Award, value: 'ISO', label: { en: 'Internationally certified', zh: '国际认证', ar: 'معتمد دوليًا' }, accent: 1 },
];

/** Rotating accent identity for icon tiles & decorative lines. */
const ACCENTS = [
  { tile: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', border: 'border-cyan-400', glow: 'hover:shadow-cyan-500/30', color: 'cyan', shadow: 'shadow-cyan-500/20', soft: 'bg-cyan-50/70' },
  { tile: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', border: 'border-emerald-400', glow: 'hover:shadow-emerald-500/30', color: 'emerald', shadow: 'shadow-emerald-500/20', soft: 'bg-emerald-50/70' },
  { tile: 'from-violet-500 to-purple-500', text: 'text-violet-600', border: 'border-violet-400', glow: 'hover:shadow-violet-500/30', color: 'violet', shadow: 'shadow-violet-500/20', soft: 'bg-violet-50/70' },
  { tile: 'from-amber-500 to-orange-500', text: 'text-amber-600', border: 'border-amber-400', glow: 'hover:shadow-amber-500/30', color: 'amber', shadow: 'shadow-amber-500/20', soft: 'bg-amber-50/70' },
];

/** Real photography used in the alternating company-story panels (next/image). */
const STORY_IMAGES = [
  '/images/cases/partnership.webp',
  '/images/cases/ice-cream-vending.webp',
  '/images/cases/pet-wash-demo.webp',
];

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  // V47: keep only the "我们的业务 / What We Do" panel (the brand 词牌). The
  // duplicate company-intro "story" block (区块B, a near-twin of the merged
  // "关于我们" section above) is dropped so the page shows ONE intro block.
  const narrative = sections.filter((s) => s.key === 'capability');
  const localeOr = <T extends string>(rec: Record<string, T>): T => (rec[locale] as T) ?? (rec.en as T);

  return (
    <div className="relative isolate overflow-hidden bg-about">
      {/* Soft, luminous colour blooms — a light, airy atmosphere (not dark). */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-24 start-0 h-[440px] w-[440px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute top-1/4 end-0 h-[460px] w-[460px] rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-1/3 start-10 h-[420px] w-[420px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 end-1/4 h-[360px] w-[360px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      {/* ══════════════════ 1. HERO (glacier world · V48 R4) ══════════════════ */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-200">
        {/* V49: Glacier scene — ambient ice environment (NOT falling shards).
            Pure CSS aurora + ice facets + light rays + frost mist. */}
        <div className="glacier-scene" aria-hidden="true">
          <div className="glacier__aurora-2" />
          <div className="glacier__ray" />
          <div className="glacier__ray" />
          <div className="glacier__mist" />
          {/* Frost sparkles — V49.2: larger, brighter, more visible */}
          {Array.from({ length: 48 }, (_, i) => (
            <span
              key={`gs-${i}`}
              className="glacier__sparkle"
              style={
                {
                  left: `${(Math.sin(i * 13.7) * 0.5 + 0.5) * 100}%`,
                  top: `${(Math.cos(i * 17.3) * 0.5 + 0.5) * 90}%`,
                  opacity: 0.6 + (i % 3) * 0.25,
                  width: `${4 + (i % 4)}px`,
                  height: `${4 + (i % 4)}px`,
                  ['--gs-dur']: `${3 + (i % 4)}s`,
                  ['--gs-delay']: `${(i % 6) * 0.5}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="container-qtech relative py-24 text-center lg:py-32">
          <span className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
            {t('about.badge') || 'About Qtech'}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-ink-900 drop-shadow-sm sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-500">
            {t('about.subtitle')}
          </p>

          {/* Stat strip with animated counters — half-translucent "ice glass". */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={s.key} delay={i * 80} className="h-full">
                  <div className="glass-ice animate-pulse-border flex h-full min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.tile} ${accent.shadow} shadow-lg animate-pulse-glow`}
                      style={{ ['--glow-color' as string]: 'rgba(34, 211, 238, 0.55)' } as React.CSSProperties}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <dt className="text-3xl font-extrabold tracking-tight text-ink-900">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </dt>
                    <dd className="text-sm font-medium text-ink-500">{t(s.key)}</dd>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ 2. ABOUT US (以匠心 text + 公司外观图) ══════════════════
          Left: 公司外观实景图. Right: 以匠心 copy + CTA. (V49: image moved to left per user request) */}
      <section className="container-qtech py-16 lg:py-24">
        <RevealOnScroll className="grid grid-cols-1 items-stretch gap-12 lg:gap-16 lg:grid-cols-2">
          {/* Left: company building photo */}
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 lg:min-h-[360px]">
            <Image
              src="/images/about/company-building-3.jpg"
              alt={t('about.aboutTitle')}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {/* Right: 以匠心 copy + CTA */}
          <div className="flex flex-col justify-center">
            <span className="brand-plaque gap-2">
              {t('about.aboutTitle')}
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              {locale === 'zh'
                ? '以匠心，打磨每一台智能售货设备'
                : locale === 'ar'
                  ? 'بإتقان، نصقل كل آلة بيع ذكية'
                : 'Crafting every smart vending machine with care'}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
              {locale === 'zh'
                ? '广州秋彦科技（Qtech）专注于智能售货设备的研发与制造，为全球 80+ 国家和地区的合作伙伴提供定制化的自助零售解决方案。从鲜花保鲜柜到披萨自动售货机，我们以匠心打磨每一台设备。'
                : locale === 'ar'
                  ? 'تتركز تقنية تشيوان (Qtech) على البحث والتطوير وتصنيع آلات البيع الذكية، وتقدم حلولاً مخصصة للبيع بالتجزئة الذاتية لشركاء في أكثر من 80 دولة ومنطقة حول العالم.'
                : 'Guangzhou Qiuyan Technology (Qtech) specializes in R&D and manufacturing of smart vending machines, delivering customized self-service retail solutions to partners in 80+ countries worldwide.'}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:from-cyan-400 hover:to-teal-400"
            >
              {locale === 'zh' ? '获取报价' : locale === 'ar' ? 'اطلب عرض سعر' : 'Get a Quote'} →
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* ══════════════════ 3. COMPANY STORY (DB-driven, alternating + photos) ════════════════ */}
      <section className="container-qtech space-y-20 py-16 lg:py-24">
        {narrative.length === 0 ? (
          <p className="text-center text-ink-400">—</p>
        ) : (
          narrative.map((section, idx) => {
            const title = localized(section.title, locale);
            const body = localized(section.body, locale);
            const SectionIcon = SECTION_ICONS[section.key] || Factory;
            const a = ACCENTS[idx % ACCENTS.length];
            const img = STORY_IMAGES[idx % STORY_IMAGES.length];
            return (
              <RevealOnScroll
                key={section.key}
                as="section"
                className="grid grid-cols-1 items-stretch gap-12 lg:gap-16 lg:grid-cols-2"
              >
                <div className={`flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* V49.2: Modern left-border label (not full-width pill) */}
                  <span className="brand-plaque gap-2">
                    <IconTile icon={SectionIcon} className="h-4 w-4" tileClassName={`bg-gradient-to-br ${a.tile} text-white p-1.5`} />
                    {title}
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
                  <div className="mt-4 space-y-4">
                    {body
                      .split(/\n{2,}/)
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((p, i) => (
                        <p key={i} className="text-base leading-relaxed text-ink-600">{p}</p>
                      ))}
                  </div>
                </div>
                {section.key === 'capability' ? (
                  /* 词牌：V49.2 compact modern glass card (less whitespace) */
                  <div className={`flex items-center justify-center ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="nameplate-3d relative flex h-full w-full min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl p-6 shadow-lg sm:p-8">
                      {/* Ambient glow */}
                      <div className="pointer-events-none absolute -top-8 start-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-3xl" />
                      {/* Subtle inner border */}
                      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50" />
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md shadow-cyan-400/30">
                          <span className="text-sm font-bold text-white">秋彦</span>
                        </div>
                        <div className="mt-3 text-2xl font-bold tracking-wide text-slate-800">QTECH</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-cyan-600/75 font-medium">Smart Vending · IoT</div>
                        {/* Minimalist divider */}
                        <div className="mt-3 h-px w-20 bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`relative min-h-[280px] overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )}
              </RevealOnScroll>
            );
          })
        )}
      </section>

      {/* ══════════════════ 3b. COMPANY ADVANTAGES (7) · V48 R7 ══════════════════
          Icon + title + description cards in the brand glassmorphism language,
          sitting directly under the "我们的业务 / What We Do" block. Trilingual
          content (see COMPANY_ADVANTAGES) plus the section heading via i18n. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="brand-plaque gap-2">
            <IconTile icon={Sparkles} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
            {t('about.advantages.eyebrow')}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {t('about.advantages.title')}
          </h2>
        </div>

        {/* V48.5: 7 cards in 2-col grid; last card spans both columns and centres
            so there is no awkward right-side blank space. */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {COMPANY_ADVANTAGES.map((a, idx) => {
            const Icon = a.icon;
            const ac = ACCENTS[idx % ACCENTS.length];
            const reversed = idx % 2 === 1;
            const isLast = idx === COMPANY_ADVANTAGES.length - 1;
            return (
              <RevealOnScroll
                key={localeOr(a.title)}
                delay={idx * 80}
                className={`h-full ${isLast ? 'sm:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className={`glass-surface group relative h-full overflow-hidden border-s-4 animate-pulse-border ${ac.border}`}>
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${ac.tile} flow-bar`} aria-hidden="true" />
                  <div className={`flex h-full items-center gap-5 p-6 ${reversed ? 'lg:flex-row-reverse lg:text-right' : ''} ${isLast ? 'flex-col items-center text-center' : ''}`}>
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9 shrink-0"
                      tileClassName={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ac.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${ac.glow}`}
                    />
                    <div className={reversed ? 'lg:text-right' : ''}>
                      <h3 className="text-xl font-bold text-ink-900">{localeOr(a.title)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(a.desc)}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 4. MANUFACTURING CAPABILITY ══════════════════
          V44: dark-glass cards (.glass-card-ink) on the light page for a clear
          contrast against the white/glassmorphism sections above and below. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
            <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-gradient-to-br from-sky-500 to-cyan-500 text-white p-1.5" />
            {locale === 'zh' ? '智造实力' : locale === 'ar' ? 'قدرات التصنيع' : 'Manufacturing Capability'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '从研发到交付的全链路品质保障'
              : locale === 'ar' ? 'ضمان الجودة من البحث حتى التسليم'
              : 'End-to-End Quality from R&D to Delivery'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MANU_CARDS.map((card, i) => {
            const Icon = card.icon;
            const tags = card.tags[locale] ?? card.tags.en;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <RevealOnScroll key={localeOr(card.title)} delay={i * 80} className="h-full">
                <div className="glass-card-ink group relative flex h-full flex-col overflow-hidden p-7">
                  {/* Micro gradient top bar (brand cyan → teal) */}
                  <span className="glass-card-ink__bar absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl" aria-hidden="true" />
                  <div className="flex items-center gap-4">
                    <IconTile icon={Icon} className="h-5 w-5" tileClassName={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md`} />
                    <h3 className="text-lg font-semibold text-white">{localeOr(card.title)}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{localeOr(card.desc)}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 4b. FACTORY & WORKSHOP SHOWCASE (V49.8) ════════════════
          Slideshow of real factory / workshop photos, placed directly under the
          "从研发到交付的全链路品质保障" manufacturing section. */}
      <FactoryShowcase />

      {/* ══════════════════ 5. CORE STRENGTHS (6) ══════════════════
          V44: each card gets a distinct COLOURED LEFT BORDER (per accent) plus
          the top flow-bar, so the six cards no longer look identical. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
            <IconTile icon={ShieldCheck} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
            {locale === 'zh' ? '我们的优势' : locale === 'ar' ? 'نقاط قوتنا' : 'Our Strengths'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '六大核心竞争力' : locale === 'ar' ? 'ست نقاط قوة تنافسية' : 'Six Core Strengths'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STRENGTHS.map((s, i) => {
            const Icon = s.icon;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <RevealOnScroll key={localeOr(s.title)} delay={i * 80} className="h-full">
                <div className={`glass-surface group relative h-full overflow-hidden border-s-4 pulse-soft ${a.border}`}>
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                  <div className="p-6">
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                    />
                    <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(s.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(s.desc)}</p>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 6. MISSION (3) ══════════════════
          V44: icon-focused layout — large centered icon on a soft tinted card
          background (per accent), centred copy. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
            <IconTile icon={Target} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
            {locale === 'zh' ? '我们的使命' : locale === 'ar' ? 'مهمتنا' : 'Our Mission'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '让智能自助真正创造价值' : locale === 'ar' ? 'جعل الخدمة الذاتية تخلق قيمة حقيقية' : 'Making Self-Service Create Real Value'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MISSION_STATEMENTS.map((m, i) => {
            const Icon = m.icon;
            const a = ACCENTS[i % ACCENTS.length];
            const mb = ['border-cyan-400', 'border-teal-400', 'border-emerald-400'][i % 3];
            return (
              <RevealOnScroll key={localeOr(m.title)} delay={i * 80} className="h-full">
                <div className={`glass-surface mission-card group relative flex h-full flex-col items-center rounded-2xl p-8 text-center border ${mb} ${a.soft}`}>
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                  <IconTile
                    icon={Icon}
                    className="h-10 w-10"
                    tileClassName={`mission-icon flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg ${a.glow}`}
                  />
                  <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(m.title)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(m.desc)}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 7. VISION (3) ══════════════════
          V44: same icon-focused treatment as Mission for visual consistency. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
            <IconTile icon={Globe2} className="h-4 w-4" tileClassName="bg-gradient-to-br from-teal-500 to-emerald-500 text-white p-1.5" />
            {locale === 'zh' ? '我们的愿景' : locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '让世界随处可享智能服务' : locale === 'ar' ? 'لنجعل الخدمة الذكية في كل مكان' : 'Smart Service, Everywhere'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VISION_STATEMENTS.map((v, i) => {
            const Icon = v.icon;
            const a = ACCENTS[(i + 1) % ACCENTS.length];
            return (
              <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                <div className={`glass-surface vision-card group relative flex h-full flex-col items-center rounded-2xl p-8 text-center ${a.soft}`}>
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                  <IconTile
                    icon={Icon}
                    className="h-10 w-10"
                    tileClassName={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                  />
                  <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(v.title)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(v.desc)}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 8. GLOBAL IMPACT DATA WALL ══════════════════ */}
      <RevealOnScroll as="section" className="bg-gradient-to-r from-cyan-50 via-teal-50 to-sky-50 py-16 lg:py-24">
        <div className="container-qtech">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
              <IconTile icon={Globe2} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
              {locale === 'zh' ? '全球影响力' : 'Global Impact'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '数据见证实力' : 'Numbers Speak'}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-3">
            {IMPACT.map((item, i) => {
              const a = ACCENTS[item.accent % ACCENTS.length];
              return (
                <RevealOnScroll key={i} delay={i * 80}>
                  <div className="glass-surface group flex h-full flex-col items-center rounded-2xl p-8 text-center animate-pulse-border">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg`}>
                      <item.icon className="h-7 w-7" />
                    </span>
                    <dt className="mt-4 text-3xl font-extrabold text-cyan-600 sm:text-4xl">{item.value}</dt>
                    <dd className="mt-1 text-sm font-medium text-ink-500">{item.label[locale] ?? item.label.en}</dd>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 9. CORE VALUES (8) ══════════════════
          V44: removed the large 01/02 watermark numbers (#10). Each card now
          carries a small ● N ordinal in brand cyan on the title row, and uses a
          coloured left border + soft tinted background for quiet differentiation. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            {t('about.valuesEyebrow') || 'Our Values'}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">{t('about.valuesTitle') || 'Our Values'}</h2>
          <p className="mt-2 text-ink-500">{t('about.valuesSubtitle') || 'What drives us forward every day.'}</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                <div className={`glass-surface group relative flex h-full flex-col p-6 ${a.soft} border-s-4 animate-pulse-border ${a.border}`}>
                  <div className="flex items-center gap-2.5">
                    {/* Small brand-cyan ordinal dot+number (replaces the big watermark).
                        V49.5: the badge now breathes (scale + cyan glow). */}
                    <span className={`value-badge inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${a.tile} text-xs font-bold text-white`} aria-hidden="true">
                      {i + 1}
                    </span>
                    <IconTile
                      icon={Icon}
                      className="h-7 w-7"
                      tileClassName={`ml-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md transition group-hover:scale-110 group-hover:shadow-lg icon-pulse`}
                    />
                  </div>
                  <h3 className="relative mt-4 text-lg font-bold text-ink-900">{localeOr(v.title)}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{localeOr(v.desc)}</p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 10. TIMELINE ══════════════════
          V44: nodes are now solid dots on a gradient connector line (the year
          moved into the card), giving a cleaner, modern timeline. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
            {locale === 'zh' ? '发展历程' : locale === 'ar' ? 'رحلتنا الزمنية' : 'Our Journey'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '十年深耕，从广州走向世界' : locale === 'ar' ? 'عقد من الخبرة: من غوانغتشو إلى العالم' : 'A Decade of Excellence, From Guangzhou to the World'}
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl">
          {/* Gradient connector line */}
          <div className="absolute top-3 bottom-3 start-3 w-0.5 rounded-full bg-gradient-to-b from-cyan-400 via-teal-400 to-sky-400 md:start-1/2 md:-translate-x-1/2" aria-hidden="true" />

          <div className="space-y-8">
            {TIMELINE.map((m, i) => {
              const left = i % 2 === 0;
              return (
                <div key={m.year} className="relative ps-12 md:ps-0">
                  {/* Solid dot node */}
                  <div className="absolute start-1.5 top-2.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 ring-4 ring-white md:start-1/2 md:-translate-x-1/2" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <div className="md:grid md:grid-cols-2 md:gap-10">
                    <div className={left ? 'md:col-start-1' : 'md:col-start-2'}>
                      <div className="glass-surface group relative p-5 animate-pulse-border">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <span className="text-base font-extrabold tracking-tight text-cyan-600">{m.year}</span>
                          <h3 className="text-lg font-bold text-ink-900">{localeOr(m.title)}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-600">{localeOr(m.desc)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 11. CERTIFICATIONS (horizontal scroll) ══════════════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            {locale === 'zh' ? '资质认证' : locale === 'ar' ? 'شهادات الاعتماد' : 'Certifications & Compliance'}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '国际标准，品质保证' : locale === 'ar' ? 'معايير دولية، ضمان الجودة' : 'International Standards, Guaranteed Quality'}
          </h2>
        </div>

        {/* Horizontal scrolling cert strip — swipe on touch / trackpad. */}
        <div className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-4">
          {CERTS.map((cert, i) => {
            const CertIcon = CERT_ICON[cert.icon] || ShieldCheck;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <div key={cert.name} className="glass-surface relative flex min-w-[180px] flex-col items-center gap-3 p-6 text-center animate-pulse-border">
                <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile}`} />
                <IconTile icon={CertIcon} className="h-8 w-8" tileClassName={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md`} />
                <span className="text-sm font-bold tracking-tight text-ink-900">{cert.name}</span>
                <span className="text-[11px] leading-snug text-ink-500">{cert.full[locale] || cert.full.en}</span>
              </div>
            );
          })}
        </div>

        {/* V47: real certificate photo below the icon cards — visual proof of
            the certifications listed above. */}
        <div className="mt-8">
          <p className="mb-4 text-center text-sm font-medium text-ink-400">
            {locale === 'zh' ? '资质认证实拍' : locale === 'ar' ? 'صور الشهادات الفعلية' : 'Real Certification Photos'}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/certificates/full-certificates.jpg"
            alt={locale === 'zh' ? 'Qtech 资质认证证书实拍' : locale === 'ar' ? 'صور شهادات اعتماد Qtech' : 'Qtech certification certificates'}
            className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg"
          />
        </div>
      </RevealOnScroll>

      {/* ══════════════════ 11b. CUSTOMER CASES (real install photos) ══════════════════ */}
      <CaseGallerySection />

      {/* ══════════════════ 12. CTA — 日照金山 / Golden Mountain at Sunrise ══════════════════
          用户明确指定：日照金山效果做在这个底部 Work With Us 深色区块。
          主 CTA（首页 CtaSection）已改为纯水族动画。 */}
      <RevealOnScroll as="section" className="container-qtech pb-20 lg:pb-28">
        <div className="cta-sky relative overflow-hidden rounded-3xl px-8 py-16 text-center md:py-20">
          {/* Drifting white clouds — 4 puffs at different positions / sizes /
              speeds. Outer wrapper handles position + scale; the inner element
              handles the sideways drift so the transforms never conflict. */}
          {[
            { left: '4%', top: '12%', scale: 1.15, dur: 22 },
            { left: '60%', top: '6%', scale: 0.8, dur: 29 },
            { left: '28%', top: '56%', scale: 1.4, dur: 18 },
            { left: '76%', top: '50%', scale: 0.92, dur: 25 },
            { left: '44%', top: '32%', scale: 1.0, dur: 33 },
          ].map((c, i) => {
            // V49.5: each cloud = a few tightly-stacked white puffs that read
            // as ONE volumetric cloud (not scattered blur spots). The wrapper's
            // scaleY(0.62) flattens it like a real flat-bottomed cloud.
            const puffs = [
              { l: 0, t: 18, w: 46, h: 46, o: 0.85 },
              { l: 22, t: 0, w: 54, h: 54, o: 0.96 },
              { l: 40, t: -6, w: 66, h: 66, o: 1 },
              { l: 64, t: 4, w: 50, h: 50, o: 0.95 },
              { l: 86, t: 18, w: 44, h: 44, o: 0.85 },
              { l: 6, t: 22, w: 116, h: 30, o: 0.8 },
            ];
            return (
            <div
              key={`sky-cloud-${i}`}
              className="absolute"
              style={{
                left: c.left,
                top: c.top,
                transform: `scale(${c.scale}) scaleY(0.62)`,
                opacity: 0.95,
                zIndex: 2,
              } as React.CSSProperties}
              aria-hidden="true"
            >
              <div
                className="cta-sky__cloud"
                style={
                  {
                    ['--cloud-dur' as string]: `${c.dur}s`,
                    animationDelay: `${i * -4}s`,
                  } as React.CSSProperties
                }
              >
                {puffs.map((p, pi) => (
                  <span
                    key={pi}
                    className="cta-sky__puff"
                    style={{
                      left: `${p.l}px`,
                      top: `${p.t}px`,
                      width: `${p.w}px`,
                      height: `${p.h}px`,
                      opacity: p.o,
                    }}
                  />
                ))}
              </div>
            </div>
            );
          })}

          {/* V49.7: birds made clearly visible — larger, deeper slate, slower
              drift, higher z-index so clouds don't bury them. Hidden under
              reduced-motion (birds are NOT brand ambient). */}
          {[
            { top: '14%', size: 44, dur: 24, delay: 0 },
            { top: '31%', size: 34, dur: 19, delay: -8 },
            { top: '22%', size: 50, dur: 27, delay: -14 },
          ].map((b, i) => (
            <div
              key={`bird-${i}`}
              className="cta-bird"
              style={
                {
                  ['--bird-top' as string]: b.top,
                  ['--bird-size' as string]: `${b.size}px`,
                  ['--bird-dur' as string]: `${b.dur}s`,
                  ['--bird-delay' as string]: `${b.delay}s`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="cta-bird__inner">
                <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 31 C 14 14, 24 14, 32 29 C 40 14, 50 14, 62 31 C 50 22, 42 22, 32 35 C 22 22, 14 22, 2 31 Z" />
                </svg>
              </div>
            </div>
          ))}

          {/* Soft cool sun-glow pooling at the top-right (subtle, not a warm sun). */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(80% 55% at 78% -10%, rgba(255,255,255,0.55), transparent 60%)',
            }}
            aria-hidden="true"
          />

          {/* Content — dark text for contrast on the blue sky. */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            <h2 className="text-3xl font-bold text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] sm:text-4xl">
              {t('about.cta') || 'Ready to Partner with Qtech?'}
            </h2>
            <p className="mx-auto max-w-xl text-base font-medium text-slate-700 sm:text-lg">
              {locale === 'zh'
                ? '联系我们获取定制报价与技术方案。'
                : locale === 'ar'
                  ? 'تواصل معنا للحصول على عرض سعر مخصص وحلول تقنية.'
                  : 'Contact us for custom quotes and technical solutions.'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:from-cyan-300 hover:to-teal-300 active:scale-[0.97]"
              >
                {t('nav.getQuote') || 'Get a Quote'}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-700/30 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.97]"
              >
                {t('nav.products') || 'Products'}
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
