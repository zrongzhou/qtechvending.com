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
  ChevronDown,
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

/* ── Manufacturing process cards ── (Excel 售货机制作生产8大工序) */
const MANU_CARDS = [
  {
    icon: PenTool,
    title: { en: 'Design & Engineering', zh: '设计与工程', ar: 'التصميم والهندسة' },
    desc: {
      en: 'Production starts with technical drawings and structure design. The engineering team confirms machine layout, cabinet size, internal space, product flow and customer customization requirements before manufacturing.',
      zh: '生产从技术图纸与结构设计开始。工程团队在制造前确认机器布局、柜体尺寸、内部空间、产品动线与客户的定制需求。',
      ar: 'يبدأ الإنتاج بالرسومات التقنية والتصميم الهيكلي. يؤكد فريق الهندسة تخطيط الآلة وأبعاد الخزانة والمساحة الداخلية وتدفق المنتج ومتطلبات التخصيص قبل التصنيع.',
    },
    tags: {
      zh: ['技术图纸', '定制需求'],
      en: ['Technical drawing', 'Customization'],
      ar: ['رسومات تقنية', 'تخصيص'],
    },
  },
  {
    icon: SlidersHorizontal,
    title: { en: 'Sheet Metal Cutting', zh: '钣金切割', ar: 'قطع الصفائح المعدنية' },
    desc: {
      en: 'Metal sheets are cut according to the confirmed drawings. Accurate cutting ensures cabinet structure, installation holes and later assembly dimensions stay consistent.',
      zh: '金属板材按确认图纸切割。精准切割确保柜体结构、安装孔位与后续装配尺寸一致。',
      ar: 'تُقطع الصفائح المعدنية وفق الرسومات المؤكدة. يضمن القطع الدقيق اتساق هيكل الخزانة وثقوب التركيب وأبعاد التجميع اللاحقة.',
    },
    tags: {
      zh: ['精准切割', '孔位一致'],
      en: ['Precision cutting', 'Consistent holes'],
      ar: ['قطع دقيق', 'ثقوب متسقة'],
    },
  },
  {
    icon: Cog,
    title: { en: 'Bending & Forming', zh: '折弯成型', ar: 'الثني والتشكيل' },
    desc: {
      en: 'Sheet metal parts are bent and formed by professional equipment, shaping panels, doors, brackets and structural parts for the vending machine cabinet.',
      zh: '钣金件由专业设备折弯成型，塑造面板、门板、支架与柜体结构件。',
      ar: 'تُثنى الصفائح وتُشكل بأجهزة احترافية، مما يشكل الألواح والأبواب والحوامل والأجزاء الهيكلية للخزانة.',
    },
    tags: {
      zh: ['折弯', '结构件'],
      en: ['Bending', 'Structural parts'],
      ar: ['ثني', 'أجزاء هيكلية'],
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Parts Preparation & Inspection', zh: '零部件准备与检验', ar: 'تجهيز وفحص الأجزاء' },
    desc: {
      en: 'Processed metal parts are checked, sorted and prepared for the next assembly stage. This reduces assembly errors and keeps production quality stable.',
      zh: '加工后的金属件经检验、分类与备料，减少装配误差、稳定生产质量。',
      ar: 'تُفحص الأجزاء المعدنية المجهزة وتُصنف وتُجهز لمرحلة التجميع التالية، مما يقلل أخطاء التجميع ويحافظ على جودة الإنتاج.',
    },
    tags: {
      zh: ['质检', '分类备料'],
      en: ['QC check', 'Sorted parts'],
      ar: ['فحص جودة', 'أجزاء مصنفة'],
    },
  },
  {
    icon: Factory,
    title: { en: 'Cabinet Assembly', zh: '柜体组装', ar: 'تجميع الخزانة' },
    desc: {
      en: 'The cabinet and key structural parts are assembled by skilled workers, building each machine body to support screens, payment systems, cooling/heating and internal components.',
      zh: '由熟练技工组装柜体与关键结构件，为后续安装屏幕、支付系统、制冷/制热系统与内部组件打好基础。',
      ar: 'يجمع عمال مهرة الخزانة والأجزاء الهيكلية الرئيسية، لتجهيز الهيكل لتركيب الشاشات وأنظمة الدفع وأنظمة التبريد/التسخين لاحقًا.',
    },
    tags: {
      zh: ['技工组装', '柜体'],
      en: ['Skilled assembly', 'Cabinet body'],
      ar: ['تجميع ماهر', 'هيكل الخزانة'],
    },
  },
  {
    icon: Palette,
    title: { en: 'Surface Treatment & Painting', zh: '表面处理与喷涂', ar: 'المعالجة السطحية والطلاء' },
    desc: {
      en: 'Cabinet parts go through surface treatment and painting to improve appearance, durability and corrosion resistance. Custom colors and branding can be prepared per customer needs.',
      zh: '柜体部件经表面处理与喷涂，提升外观、耐久与防腐性能，并可按客户需求定制颜色与品牌标识。',
      ar: 'تمر أجزاء الخزانة بالمعالجة السطحية والطلاء لتحسين المظهر والمتانة ومقاومة التآكل، ويمكن تخصيص الألوان والعلامة التجارية حسب الطلب.',
    },
    tags: {
      zh: ['喷涂', '品牌定制'],
      en: ['Painting', 'Custom branding'],
      ar: ['طلاء', 'علامة مخصصة'],
    },
  },
  {
    icon: Cpu,
    title: { en: 'Machine Assembly', zh: '整机装配', ar: 'تجميع الآلة' },
    desc: {
      en: 'The main cabinet, display, shelves, doors, payment modules, electronic parts and internal systems are installed step by step according to the machine model.',
      zh: '按机型逐步安装主机柜、显示屏、货架、门体、支付模块、电子件与内部系统。',
      ar: 'تُركّب الخزانة الرئيسية والشاشة والأرفف والأبواب ووحدات الدفع والأجزاء الإلكترونية والأنظمة الداخلية خطوة بخطوة حسب الطراز.',
    },
    tags: {
      zh: ['整机装配', '按机型'],
      en: ['Full assembly', 'By model'],
      ar: ['تجميع كامل', 'حسب الطراز'],
    },
  },
  {
    icon: ShieldCheck,
    title: { en: 'Testing & Quality Control', zh: '测试与质检', ar: 'الاختبار ومراقبة الجودة' },
    desc: {
      en: 'Before delivery, each machine is tested for appearance, structure, power, payment, screen operation, refrigeration/heating and overall performance to ensure it is ready for commercial use.',
      zh: '出货前逐台测试外观、结构、通电、支付、屏幕、制冷/制热与整体性能，确保可商用。',
      ar: 'قبل التسليم، تُختبر كل آلة من حيث المظهر والهيكل والطاقة والدفع والشاشة ووظائف التبريد/التسخين والأداء العام لضمان جاهزيتها للاستخدام التجاري.',
    },
    tags: {
      zh: ['全面测试', '可商用'],
      en: ['Full test', 'Commercial ready'],
      ar: ['اختبار شامل', 'جاهز تجاريًا'],
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

/* ── Company timeline ── (Excel 公司发展历史程, 9 milestones) */
const TIMELINE: MilestoneItem[] = [
  {
    year: '2015',
    title: { en: 'The Beginning', zh: '起步之年', ar: 'البداية' },
    desc: {
      en: 'Qtech Vending was founded in 2015, starting with advertising display screens and traditional snack and drink vending machines. From the beginning, we focused on practical vending solutions that help customers sell products more efficiently.',
      zh: 'Qtech Vending 于 2015 年成立，从广告屏与传统零食饮料售货机起步，始终专注于帮助客户更高效销售产品的实用方案。',
      ar: 'تأسست Qtech Vending في 2015، بدأت بشاشات العرض الإعلانية وآلات البيع التقليدية للوجبات والمشروبات. ومنذ البداية ركزنا على حلول بيع عملية تساعد العملاء على البيع بكفاءة.',
    },
  },
  {
    year: '2016',
    title: { en: 'Ice Vending Development', zh: '制冰机研发', ar: 'تطوير آلات الثلج' },
    desc: {
      en: 'After strong demand from customers in South America, we began developing ice vending machines. This customer-driven project taught us that different markets need different vending solutions.',
      zh: '应南美客户的强烈需求，我们开始研发制冰售货机。这次以客户驱动的项目让我们意识到不同市场需要不同的售货方案。',
      ar: 'بناءً على طلب قوي من عملاء في أمريكا الجنوبية، بدأنا تطوير آلات بيع الثلج. علّمنا هذا المشروع المدفوع بالعملاء أن الأسواق المختلفة تحتاج حلول بيع مختلفة.',
    },
  },
  {
    year: '2017',
    title: { en: 'Expanding Ice Vending', zh: '制冰方案拓展', ar: 'توسيع حلول الثلج' },
    desc: {
      en: 'As our business grew, the specifications and capacity of our ice vending machines kept expanding. With stable performance and practical design, they were exported in larger volumes to overseas markets.',
      zh: '随着业务增长，制冰机的规格与容量持续拓展。凭借稳定性能与实用设计，出口海外的数量不断增加。',
      ar: 'مع نمو أعمالنا، استمر توسيع مواصفات وسعة آلات الثلج. بفضل الأداء المستقر والتصميم العملي، زادت صادراتها إلى الأسواق الخارجية.',
    },
  },
  {
    year: '2018',
    title: { en: 'Hot Food Vending', zh: '进军热食售货', ar: 'الانتقال إلى بيع الطعام الساخن' },
    desc: {
      en: 'To meet growing demand for automated food retail, we started developing food vending machines — including pizza, French fries and other hot-food vending solutions.',
      zh: '为满足自动食品零售的增长需求，我们开始研发食品售货机，包括披萨、薯条等热食售货方案。',
      ar: 'تلبيةً للطلب المتزايد على البيع بالتجزئة الآلي للأطعمة، بدأنا تطوير آلات بيع الطعام بما فيها البيتزا والبطاطس المقلية وحلول الطعام الساخن.',
    },
  },
  {
    year: '2019',
    title: { en: 'Entering Global Markets', zh: '迈向全球市场', ar: 'دخول أسواق عالمية' },
    desc: {
      en: 'By 2019, Qtech Vending had exported machines to multiple countries — especially Europe, the United States and Canada. These markets pushed us to raise product quality, UX and service standards.',
      zh: '截至 2019 年，Qtech 售货机已出口至多个国家，尤其是欧洲、美国与加拿大。这些市场推动我们提升产品质量、体验与服务标准。',
      ar: 'بحلول 2019، صدّرت Qtech آلاتها إلى عدة بلدان — لا سيما أوروبا والولايات المتحدة وكندا. دفعتنا هذه الأسواق لرفع جودة المنتج وتجربة المستخدم ومعايير الخدمة.',
    },
  },
  {
    year: '2022',
    title: { en: 'Stronger R&D & Customization', zh: '研发与定制升级', ar: 'قدرات أقوى في البحث والتخصيص' },
    desc: {
      en: 'Our R&D team kept growing, enabling us to deliver more customized vending solutions for different customers, products, locations and business models.',
      zh: '研发团队持续壮大，使我们能为不同客户、产品、场景与商业模式提供更定制化的售货方案。',
      ar: 'استمر نمو فريق البحث والتطوير، مما مكّننا من تقديم حلول بيع مخصصة أكثر لعملاء ومنتجات ومواقع ونماذج أعمال مختلفة.',
    },
  },
  {
    year: '2023',
    title: { en: 'Flower Vending Innovation', zh: '鲜花售货创新', ar: 'ابتكار آلات الزهور' },
    desc: {
      en: 'Seeing the potential of fresh-flower retail, we developed flower vending machines with refrigerated display, self-service payment and smart management for florists and gift retailers.',
      zh: '看好鲜花零售潜力，我们推出带冷藏展示、自助支付与智能管理的鲜花售货机，服务花店与礼品零售。',
      ar: 'إدراكًا لإمكانات تجارة الزهور الطازجة، طوّرنا آلات بيع الزهور بعرض مبرّد ودفع ذاتي وإدارة ذكية لأصحاب الزهور ومتاجر الهدايا.',
    },
  },
  {
    year: '2025',
    title: { en: 'Customer-Centered Strategy', zh: '客户为先战略', ar: 'استراتيجية محورها العميل' },
    desc: {
      en: 'In 2025 we refined our direction — focusing on major standard vending categories while strengthening custom solutions. Our goal is not only to sell machines, but to help customers create real business value.',
      zh: '2025 年我们厘清方向：聚焦主要标准品类，同时强化定制能力。目标不仅是卖机器，更是帮客户创造真实的商业价值。',
      ar: 'في 2025 رسمنا توجهنا — التركيز على الفئات القياسية الرئيسية مع تعزيز الحلول المخصصة. هدفنا ليس بيع الآلات فحسب، بل مساعدة العملاء على خلق قيمة تجارية حقيقية.',
    },
  },
  {
    year: '2026',
    title: { en: '800+ Customers & Beyond', zh: '800+ 客户，持续前行', ar: 'أكثر من 800 عميل ومستمرون' },
    desc: {
      en: 'By 2026, Qtech Vending had helped 800+ customers solve practical vending challenges. We keep improving machines, services and customization with one principle: customer value comes first.',
      zh: '截至 2026 年，Qtech 已帮助 800+ 客户解决实际售货难题。我们持续打磨设备、服务与定制能力，坚持一条原则：客户价值第一。',
      ar: 'بحلول 2026، ساعدت Qtech أكثر من 800 عميل على حل تحديات البيع العملية. نواصل تحسين الآلات والخدمات والتخصيص بمبدأ واحد: قيمة العميل أولًا.',
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
  { end: 80, suffix: '+', icon: Globe2, key: 'hero.statCountries' },
  { end: 500, suffix: '+', icon: Users, key: 'hero.statPartners' },
  { end: 24, suffix: '/7', icon: Clock, key: 'hero.statService' },
];

/* V49.20: cohesive cyan→blue family for the glacier hero stat cards so the
   four icon tiles read as one cold, premium set (no violet/amber clash). */
const HERO_STAT_ACCENTS = [
  { tile: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/30' },
  { tile: 'from-sky-400 to-cyan-500', shadow: 'shadow-sky-500/30' },
  { tile: 'from-teal-400 to-cyan-500', shadow: 'shadow-teal-500/30' },
  { tile: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/30' },
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

/* ── Company FAQ (Excel 客户经常问的问题) ── */
const COMPANY_FAQ: { q: Record<string, string>; a: Record<string, string> }[] = [
  {
    q: { en: 'What is your MOQ?', zh: '你们的最小起订量是多少？', ar: 'ما هو الحد الأدنى للطلب؟' },
    a: {
      en: 'Our MOQ is 1 unit. We support both sample orders and bulk orders.',
      zh: '最小起订量为 1 台，支持样品订单与批量订单。',
      ar: 'الحد الأدنى للطلب هو وحدة واحدة. ندعم طلبات العينات والطلبات بالجملة.',
    },
  },
  {
    q: { en: 'Can you customize vending machines?', zh: '你们可以定制售货机吗？', ar: 'هل يمكنكم تخصيص آلات البيع؟' },
    a: {
      en: 'Yes. We have a strong R&D team for both hardware and software customization, including cabinet design, product layout, payment system, touch screen interface, cooling or heating functions, and branding.',
      zh: '可以。我们拥有强大的软硬件研发团队，可定制柜体设计、产品布局、支付系统、触摸屏界面、制冷或制热功能以及品牌外观。',
      ar: 'نعم. لدينا فريق قوي للبحث والتطوير للأجهزة والبرمجيات، بما في ذلك تصميم الخزانة وتخطيط المنتج ونظام الدفع وواجهة اللمس ووظائف التبريد أو التسخين والعلامة التجارية.',
    },
  },
  {
    q: { en: 'How do you pack the machines for shipping?', zh: '机器如何包装运输？', ar: 'كيف تغلفون الآلات للشحن؟' },
    a: {
      en: 'We use export-standard wooden case packaging. Our machines have been exported to many countries, and the packaging protects the machine from moisture, sea-transport corrosion and collision damage.',
      zh: '采用出口标准木箱包装。我们的设备已出口至多个国家，该包装可有效防潮、防海运腐蚀并避免运输碰撞损伤。',
      ar: 'نستخدم تغليفًا بصناديق خشبية بمعيار التصدير. صُدرت آلاتنا إلى العديد من البلدان، ويحمي التغليف الآلة من الرطوبة وتآكل الشحن البحري وأضرار الاصطدام.',
    },
  },
  {
    q: { en: 'What vending machines do you offer?', zh: '你们提供哪些售货机？', ar: 'ما آلات البيع التي تقدمونها؟' },
    a: {
      en: 'We offer snack and drink vending machines, pizza vending machines, ice vending machines, hot food vending machines, ice cream vending machines, blind box vending machines, flower vending machines, and other customized vending solutions.',
      zh: '我们提供零食饮料机、披萨机、制冰机、热食机、冰淇淋机、盲盒机、鲜花机及其他定制售货方案。',
      ar: 'نقدم آلات وجبات ومشروبات، بيتزا، ثلج، أطعمة ساخنة، آيس كريم، صناديق مفاجآت، زهور، وحلول بيع مخصصة أخرى.',
    },
  },
  {
    q: { en: 'Do you provide after-sales service?', zh: '你们提供售后服务吗？', ar: 'هل تقدمون خدمة ما بعد البيع؟' },
    a: {
      en: 'Yes. Our after-sales team can guide you on machine operation and help solve problems during use. We require our service team to reply within 24 hours and provide a solution plan within 48 hours.',
      zh: '提供。售后团队可指导设备操作并协助解决使用问题，承诺 24 小时内响应、48 小时内给出解决方案。',
      ar: 'نعم. يمكن لفريق ما بعد البيع إرشادك في تشغيل الآلة والمساعدة في حل المشكلات، مع الرد خلال 24 ساعة وتقديم خطة حل خلال 48 ساعة.',
    },
  },
  {
    q: { en: 'What is the warranty?', zh: '保修期是多久？', ar: 'ما هي فترة الضمان؟' },
    a: {
      en: 'We provide a 2-year warranty for our vending machines.',
      zh: '我们提供 2 年质保。',
      ar: 'نوفر ضمانًا لمدة سنتين لآلات البيع.',
    },
  },
];

/* ── Company solutions (Excel 能给客户解决什么问题) ── */
const COMPANY_SOLUTIONS: { icon: LucideIcon; title: Record<string, string>; desc: Record<string, string> }[] = [
  {
    icon: Package,
    title: { en: 'Food & Beverage Solutions', zh: '食品饮料方案', ar: 'حلول الأطعمة والمشروبات' },
    desc: {
      en: 'For snacks, drinks, coffee, ready meals, hot food, frozen food and fast food retail. Suitable for offices, schools, hospitals, factories, hotels, stations and malls.',
      zh: '适用于零食、饮料、咖啡、鲜食、热食、冷冻与快餐零售，覆盖办公室、学校、医院、工厂、酒店、车站与商场。',
      ar: 'للبيع بالتجزئة للوجبات والمشروبات والقهوة والوجبات الجاهزة والأطعمة الساخنة والمجمدة والوجبات السريعة. مناسب للمكاتب والمدارس والمستشفيات والمصانع والفنادق والمحطات والمراكز التجارية.',
    },
  },
  {
    icon: Cog,
    title: { en: 'Pizza Vending Solutions', zh: '披萨售货方案', ar: 'حلول بيع البيتزا' },
    desc: {
      en: 'For indoor, semi-outdoor and fully outdoor pizza vending projects. The machine supports frozen storage, automatic heating, payment system, pickup area and custom branding.',
      zh: '适用于室内、半室外与全室外披萨售货项目。设备支持冷冻储存、自动加热、支付系统、取货区与品牌定制。',
      ar: 'لمشاريع بيع البيتزا داخليًا ونصف خارجي وخارجي بالكامل. تدعم الآلة التخزين المجمد والتسخين التلقائي ونظام الدفع ومنطقة الاستلام والعلامة المخصصة.',
    },
  },
  {
    icon: Cpu,
    title: { en: 'Ice Vending Solutions', zh: '制冰售货方案', ar: 'حلول بيع الثلج' },
    desc: {
      en: 'For bagged ice, bulk ice and ice-and-water vending businesses. Suitable for gas stations, convenience stores, fishing ports, seafood markets, resorts and communities.',
      zh: '适用于袋装冰、散装冰与冰水售货，覆盖加油站、便利店、渔港、海鲜市场、度假村与社区。',
      ar: 'لأعمال الثلج المعبأ والثلج بالجملة والثلج والمياه. مناسب لمحطات الوقود والمتاجر والموانئ والأسواق البحرية والمنتجعات والمجتمعات.',
    },
  },
  {
    icon: Sparkles,
    title: { en: 'Flower Vending Solutions', zh: '鲜花售货方案', ar: 'حلول بيع الزهور' },
    desc: {
      en: 'For bouquets, roses, floral gifts and preserved flowers. Refrigerated cabinets, transparent display, lighting and self-service payment help florists sell flowers 24/7.',
      zh: '适用于花束、玫瑰、花卉礼品与永生花。冷藏柜、透明展示、灯光与自助支付助花店 24/7 售花。',
      ar: 'للباقات والورود والهدايا الزهرية والزهور المحفوظة. الخزائن المبردة والعرض الشفاف والإضاءة والدفع الذاتي تساعد بائعي الزهور على البيع على مدار الساعة.',
    },
  },
  {
    icon: Palette,
    title: { en: 'Beauty & Pet Vending Solutions', zh: '美妆与宠物方案', ar: 'حلول التجميل والحيوانات الأليفة' },
    desc: {
      en: 'For cosmetics, eyelashes, skincare, pet food, pet treats and pet care products. Cabinet design, product layout, cooling system and screen interface can be customized.',
      zh: '适用于化妆品、假睫毛、护肤、宠物粮、宠物零食与宠物护理品。柜体设计、产品布局、制冷系统与屏幕界面均可定制。',
      ar: 'لمستحضرات التجميل والرموش والعناية بالبشرة وأغذية الحيوانات وأطعمتها ومنتجات العناية. يمكن تخصيص تصميم الخزانة وتخطيط المنتج ونظام التبريد والشاشة.',
    },
  },
  {
    icon: SlidersHorizontal,
    title: { en: 'Blind Box & Locker Solutions', zh: '盲盒与柜格方案', ar: 'حلول الصناديق المفاجئة والخزائن' },
    desc: {
      en: 'For blind boxes, toys, gifts, collectibles, trading cards and other surprise retail products. Locker quantity, compartment size and random opening function can be customized.',
      zh: '适用于盲盒、玩具、礼品、收藏品、卡牌等惊喜零售。柜格数量、格口尺寸与随机开启功能均可定制。',
      ar: 'لصناديق المفاجآت والألعاب والهدايا والتحف وبطاقات التداول وغيرها. يمكن تخصيص عدد الخزائن وحجم الحجرات ووظيفة الفتح العشوائي.',
    },
  },
];

/* ── What we can customize (Excel 8 items) ── */
const CUSTOMIZE_LIST: Record<string, string>[] = [
  { en: 'Cabinet size and product layout', zh: '柜体尺寸与产品布局', ar: 'أبعاد الخزانة وتخطيط المنتج' },
  { en: 'Cooling, freezing or heating system', zh: '制冷、冷冻或制热系统', ar: 'نظام تبريد أو تجميد أو تسخين' },
  { en: 'Touch screen interface and language', zh: '触摸屏界面与语言', ar: 'واجهة اللمس واللغة' },
  { en: 'Cashless payment system', zh: '无现金支付系统', ar: 'نظام دفع بدون نقد' },
  { en: 'Remote management system', zh: '远程管理系统', ar: 'نظام إدارة عن بُعد' },
  { en: 'Product dispensing method', zh: '商品出货方式', ar: 'طريقة صرف المنتج' },
  { en: 'Logo, color, lighting and cabinet branding', zh: 'Logo、颜色、灯光与柜体品牌', ar: 'الشعار والألوان والإضاءة والعلامة' },
  { en: 'Export packaging and after-sales support', zh: '出口包装与售后支持', ar: 'تغليف التصدير ودعم ما بعد البيع' },
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
        <div className="absolute top-1/4 end-0 h-[460px] w-[460px] rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute bottom-1/3 start-10 h-[420px] w-[420px] rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute bottom-0 end-1/4 h-[360px] w-[360px] rounded-full bg-sky-200/30 blur-3xl" />
      </div>


      {/* ══════════════════ 1. HERO (glacier world · V48 R4) ══════════════════ */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-cyan-50 via-slate-50 to-white">
        {/* V49: Glacier scene — ambient ice environment (NOT falling shards).
            Pure CSS aurora + ice facets + light rays + frost mist. */}
        <div className="glacier-scene" aria-hidden="true">
          <div className="glacier__aurora-2" />
          <div className="glacier__ray" />
          <div className="glacier__ray" />
          <div className="glacier__mist" />
          {/* Frost sparkles — V49.22: multi-colour ice crystals with varied hues */}
          {Array.from({ length: 48 }, (_, i) => {
            // Cycle through cyan / sky-blue / teal / ice-blue hues for visual variety
            const hues = [195, 200, 187, 210, 175, 220];
            return (
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
                  ['--gs-hue']: `${hues[i % hues.length]}`,
                } as React.CSSProperties
              }
            />
          );
          })}
        </div>

        <div className="container-qtech relative py-24 text-center lg:py-32">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-cyan-100 backdrop-blur-sm ring-1 ring-white/25">
            {t('about.badge') || 'About Qtech'}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-cyan-100/85">
            {t('about.subtitle')}
          </p>

          {/* Stat strip with animated counters — glass-morphism cards with per-card light sweep */}
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              const accent = HERO_STAT_ACCENTS[i % HERO_STAT_ACCENTS.length];
              return (
                <RevealOnScroll key={s.key} delay={i * 80} className="h-full">
                  <div className="group relative h-full min-h-[160px] overflow-hidden rounded-2xl bg-white/10 p-5 shadow-lg shadow-cyan-900/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20 ring-1 ring-white/20">
                  {/* Per-card pulsing light beam — staggered per card */}
                  <div
                    className="card-beam-container"
                    style={{
                      ['--card-beam-dur' as string]: `${3.5 + (i * 0.6)}s`,
                      ['--card-beam-delay' as string]: `${i * 0.7}s`,
                    } as React.CSSProperties}
                  />
                  {/* Top accent line per card */}
                  <span className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accent.tile}`} aria-hidden="true" />
                  {/* Subtle inner glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center relative z-10">
                    <span
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.tile} ${accent.shadow} shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-cyan-400/30`}
                      style={{ ['--glow-color' as string]: 'rgba(34, 211, 238, 0.55)' } as React.CSSProperties}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <dt className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </dt>
                    <dd className="text-sm font-medium text-cyan-100/80">{t(s.key)}</dd>
                  </div>
                </div>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* Pulsing light beam below stat cards — thicker & slower */}
          <div className="relative mx-auto mt-10 w-full max-w-4xl overflow-hidden">
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
            <div className="absolute top-0 h-[3px] w-56 animate-[beam-sweep_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent" />
          </div>
        </div>
      </section>


      {/* ══════════════════ 2. ABOUT US (以匠心 text + 公司外观图) ══════════════════
          Left: 公司外观实景图. Right: 以匠心 copy + CTA. (V49: image moved to left per user request)
          V49.21: subtle cyan-tinted background for smooth transition from glacier hero */}
      <section className="container-qtech bg-gradient-to-b from-slate-50/80 via-white to-white py-16 lg:py-24">
        {/* ABOUT US plaque — section-level centered (between image & text columns) */}
        <div className="mb-10 flex justify-center">
          <span className="brand-plaque gap-2">
            {t('about.aboutTitle')}
          </span>
        </div>

        <RevealOnScroll className="grid grid-cols-1 items-center gap-12 lg:gap-16 lg:grid-cols-2">
          {/* Left: company building photo — fixed 4:3 ratio, never stretched by the grid */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative aspect-[16/10] w-full max-w-[460px] overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100">
              <Image
                src="/images/about/company-building-3.jpg"
                alt={t('about.aboutTitle')}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative line + caption below photo */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
              <p className="text-xs font-medium tracking-widest text-brand-600/70 uppercase">
                {locale === 'zh' ? '广州 · 研发与生产基地'
                  : locale === 'ar' ? 'غوانغتشو · مركز البحث والتطوير والإنتاج'
                  : 'Guangzhou · R&D & Manufacturing Base'}
              </p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
            </div>
          </div>
          {/* Right: 以匠心 copy (badge moved to section-level) */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              {locale === 'zh'
                ? '以匠心，打磨每一台智能售货设备'
                : locale === 'ar'
                  ? 'بإتقان، نصقل كل آلة بيع ذكية'
                : 'Crafting every smart vending machine with care'}
            </h2>
            {/* 公司介绍 — Excel「公司介绍」行 (ROW 0) 原文，按表格来，三语一致 */}
            {(() => {
              const INTRO: Record<string, string[]> = {
                zh: [
                  'Qtech Vending 是一家拥有 10 余年经验的智能售货机厂家，深耕自动零售行业。我们从传统零食饮料售货机起步，持续拓展到鲜花售货机、披萨售货机、热食售货机、制冰售货机、鲜食售货机，以及面向不同业务场景的定制售货方案。',
                  '我们深知，客户买的不仅是一台机器，而是一套可靠的经营方式——延长营业时间、降低人工成本、提升顾客便利、创造新的销售机会。因此，我们始终围绕客户想卖什么、机器用在哪、用户怎么付款、生意如何运营，提供务实可落地的方案。',
                  '秉持以客户为中心的理念，Qtech Vending 持续优化产品质量、用户体验、支付系统、远程管理与定制能力，助力运营商、零售商、经销商与场地方打造灵活、智能、可盈利的 24/7 自助生意。',
                ],
                en: [
                  'Qtech Vending is a smart vending machine manufacturer with more than 10 years of experience in the automated retail industry. We started with traditional snack and drink vending machines and have continued to expand into flower vending machines, pizza vending machines, hot food vending machines, ice vending machines, fresh food machines, and customized vending solutions for different business needs.',
                  'We understand that customers are not just buying a machine. They are looking for a reliable way to extend business hours, reduce labor costs, improve customer convenience, and create new sales opportunities. That is why we focus on practical solutions based on what customers want to sell, where the machine will be used, how users will pay, and how the business will operate.',
                  'With a customer-centered mindset, Qtech Vending continues to improve product quality, user experience, payment systems, remote management, and customization options. We aim to help operators, retailers, distributors, and venue owners build smart, flexible, and profitable 24/7 self-service businesses.',
                ],
                ar: [
                  'Qtech Vending هي شركة مصنعة لآلات البيع الذكية بخبرة تزيد عن 10 سنوات في صناعة التجزئة الآلية. بدأنا بآلات بيع الوجبات الخفيفة والمشروبات التقليدية وتوسعنا إلى آلات بيع الزهور والبيتزا والطعام الساخن والثلج والأطعمة الطازجة وحلول البيع المخصصة لمختلف الاحتياجات التجارية.',
                  'نحن ندرك أن العملاء لا يشترون مجرد آلة، بل يبحثون عن طريقة موثوقة لإطالة ساعات العمل، وتقليل تكاليف العمالة، وتحسين راحة العملاء، وخلق فرص مبيعات جديدات. لذلك نركز على حلول عملية تستند إلى ما يريد العملاء بيعه، وأين سيُستخدم الجهاز، وكيف يدفع المستخدمون، وكيف تدار الأعمال.',
                  'ومع عقلية تركز على العميل، تواصل Qtech Vending تحسين جودة المنتج، وتجربة المستخدم، وأنظمة الدفع، والإدارة عن بُعد، وخيارات التخصيص، بهدف مساعدة المشغلين والتجار والموزعين وأصحاب المواقع على بناء أعمال خدمة ذاتية ذكية ومرنة ومربحة على مدار 24/7.',
                ],
              };
              const paras = INTRO[locale] ?? INTRO.en;
              return (
                <div className="mt-4 max-w-prose space-y-4 rounded-xl bg-white/60 p-6 backdrop-blur-sm ring-1 ring-slate-200/70">
                  {paras.map((p, i) => (
                    <p key={i} className="ps-3 text-[15px] leading-8 text-ink-800 sm:text-[16px]" style={{ borderLeft: '3px solid rgba(8,145,178,0.2)' }}>{p}</p>
                  ))}
                </div>
              );
            })()}
          </div>
        </RevealOnScroll>

        {/* CTA button — section-level centered (between image & text columns) */}
        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:from-cyan-400 hover:to-teal-400"
          >
            {locale === 'zh' ? '获取报价' : locale === 'ar' ? 'اطلب عرض سعر' : 'Get a Quote'} →
          </Link>
        </div>
      </section>


      {/* ══════════════════ 3. 公司发展历史程 / TIMELINE (表格顺序) ══════════════════
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


      {/* ══════════════════ 4. 售货机制作生产8大工序 / MANUFACTURING (表格顺序) ══════════════════
          V44: dark-glass cards (.glass-card-ink) on the light page for a clear
          contrast against the white/glassmorphism sections above and below. */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
              <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-gradient-to-br from-sky-500 to-cyan-500 text-white p-1.5" />
              {locale === 'zh' ? '智造实力' : locale === 'ar' ? 'قدرات التصنيع' : 'Manufacturing Capability'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '售货机制作生产8大工序'
                : locale === 'ar' ? '8 خطوات لتصنيع آلات البيع'
                : '8 Steps of Vending Machine Manufacturing'}
            </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MANU_CARDS.map((card, i) => {
            const Icon = card.icon;
            const tags = card.tags[locale] ?? card.tags.en;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <RevealOnScroll key={localeOr(card.title)} delay={i * 80} className="h-full">
                <div className="glass-card-ink group relative flex h-full flex-col overflow-hidden">
                  {/* Micro gradient top bar (brand cyan → teal) */}
                  <span className="glass-card-ink__bar absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl" aria-hidden="true" />
                  {/* Process photo — Excel「售货机制作生产8大工序」配图 (step 1..8) */}
                  <div className="relative h-60 w-full shrink-0 overflow-hidden">
                    <Image
                      src={`/images/about/process/step${i + 1}.webp`}
                      alt={localeOr(card.title)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
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


      {/* ══════════════════  5. 为什么选择我们 / WHY CHOOSE US (表格顺序)  ════════════════ */}
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
                className="grid grid-cols-1 items-center gap-12 lg:gap-16 lg:grid-cols-2"
              >
                <div className={`flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {/* V49.2: Modern left-border label (not full-width pill) */}
                  <span className="brand-plaque gap-2">
                    <IconTile icon={SectionIcon} className="h-4 w-4" tileClassName={`bg-gradient-to-br ${a.tile} text-white p-1.5`} />
                    {title}
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
                  <div className="mt-4 max-w-prose space-y-4 rounded-xl bg-white/60 p-6 backdrop-blur-sm ring-1 ring-slate-200/70">
                    {body
                      .split(/\n{2,}/)
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((p, i) => (
                        <p key={i} className="ps-3 text-[15px] leading-8 text-ink-800 sm:text-[16px]" style={{ borderLeft: '3px solid rgba(8,145,178,0.2)' }}>{p}</p>
                      ))}
                  </div>
                </div>
                {section.key === 'capability' ? (
                  /* 词牌：V49.2 compact modern glass card (less whitespace) */
                  <div className={`flex flex-col items-center ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="nameplate-3d relative mx-auto flex w-full max-w-[400px] min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl p-6 shadow-lg sm:p-8">
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
                    {/* Pulsing light beam below the nameplate — thicker & slower */}
                    <div className="relative mt-5 w-full max-w-[320px] overflow-hidden">
                      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
                      <div className="absolute top-0 h-[3px] w-44 animate-[beam-sweep_3.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent" />
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


      {/* ══════════════════ 7. 能给客户解决什么问题 / SOLUTIONS (表格顺序) ══════════════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 ring-1 ring-cyan-200">
            <IconTile icon={Package} className="h-4 w-4" tileClassName="bg-gradient-to-br from-cyan-500 to-teal-500 text-white p-1.5" />
            {locale === 'zh' ? '解决方案' : locale === 'ar' ? 'حلولنا' : 'Our Solutions'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '我们能提供的售货机方案' : locale === 'ar' ? 'حلول آلات البيع التي نقدمها' : 'Vending Machine Solutions We Provide'}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMPANY_SOLUTIONS.map((s, i) => {
            const Icon = s.icon;
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <RevealOnScroll key={i} delay={i * 80} className="h-full">
                <div className={`glass-surface group relative h-full overflow-hidden border-s-4 animate-pulse-border ${a.border}`}>
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                  <div className="p-6">
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                    />
                    <h3 className="mt-5 text-xl font-bold text-ink-900">{s.title[locale] ?? s.title.en}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{s.desc[locale] ?? s.desc.en}</p>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* What we can customize (Excel 8 items) */}
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-white/60 p-7 backdrop-blur-xl">
          <h3 className="text-center text-lg font-bold text-ink-900">
            {locale === 'zh' ? '我们能定制的内容' : locale === 'ar' ? 'ما يمكننا تخصيصه' : 'What We Can Customize'}
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CUSTOMIZE_LIST.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-cyan-50/60 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-xs font-bold text-white">{i + 1}</span>
                <span className="text-sm font-medium text-ink-700">{c[locale] ?? c.en}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>


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

      {/* ══════════════════ (moved) 客户经常问的问题 / FAQ — now rendered as the LAST section, after CaseGallerySection ══════════════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 ring-1 ring-teal-200">
            <IconTile icon={ChevronDown} className="h-4 w-4" tileClassName="bg-gradient-to-br from-teal-500 to-emerald-500 text-white p-1.5" />
            {locale === 'zh' ? '常见问题' : locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {locale === 'zh' ? '客户经常问的问题' : locale === 'ar' ? 'الأسئلة التي يطرحها العملاء غالبًا' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {COMPANY_FAQ.map((item, i) => (
            <details key={i} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                <span className="text-sm font-medium text-ink-800">{localized(item.q, locale)}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-ink-600">{localized(item.a, locale)}</p>
            </details>
          ))}
        </div>
      </RevealOnScroll>


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
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 ring-1 ring-white/40 transition-all duration-300 hover:-translate-y-1 hover:from-cyan-400 hover:to-teal-400 hover:shadow-xl hover:shadow-teal-400/30 active:scale-[0.97]"
              >
                {t('nav.getQuote') || 'Get a Quote'}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/60 bg-white/80 px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-lg active:scale-[0.97]"
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
