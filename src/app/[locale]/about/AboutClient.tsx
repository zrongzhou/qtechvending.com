'use client';

import Link from 'next/link';
import {
  Palette,
  ShieldCheck,
  Cpu,
  BadgeDollarSign,
  Headphones,
  ArrowUpCircle,
  Lightbulb,
  BarChart3,
  TrendingUp,
  RefreshCw,
  BadgeCheck,
  Factory,
  Cog,
  Globe2,
  Target,
  Sparkles,
  Store,
  Leaf,
  Users,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import CountUp from '@/components/ui/CountUp';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
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

/* ── Company intro (user-provided V36 copy) ── */
const COMPANY_INTRO: { body: Record<string, string> } = {
  body: {
    en: "Welcome to our official website. We're a Qiuyan (Qtech) vending company dedicated to developing, manufacturing, and selling vending machines. We're all about using innovative technology to offer convenient, efficient, and personalized vending solutions.\n\nOur main products are ice, fruit, cotton candy, pizza, and flower vending machines, which not only satisfy the market's appetite for novel experiences but also reflect our commitment to quality and service.\n\nWe focus on innovating and refining vending machines, paying close attention to every detail to ensure our products stand out and perform well in the market. Here's what makes us strong: creative design, premium materials, smart management, affordable quality, all-round service, and continuous improvement.",
    zh: '欢迎来到我们的官方网站。我们是广州秋彦科技（Qtech）——一家致力于研发、制造和销售自动售货机的公司。我们运用创新科技，为全球客户提供便捷、高效、个性化的自动售卖解决方案。\n\n我们的主营产品包括冰品、水果、棉花糖、披萨和鲜花自动售货机，既满足市场对新颖体验的需求，也体现了我们对品质和服务的承诺。\n\n我们专注于创新与打磨自动售货机，关注每一个细节，确保产品在市场上脱颖而出、表现优异。我们的优势：创意设计、优质材料、智能管理、高性价比、全程服务、持续改进。',
    ar: 'مرحبًا بكم في موقعنا الرسمي. نحن شركة تشيويان (Qtech) للآلات الذكية، متخصصون في تطوير وتصنيع وبيع آلات البيع. نهدف إلى تقديم حلول بيع آلية مريحة وفعالة وشخصية من خلال التكنولوجيا المبتكرة.\n\nتشمل منتجاتنا الرئيسية آلات بيع الثلج والفواكه والحلوى القطنية والبيتزا والزهور، التي تلبي رغبة السوق في تجارب جديدة وتعكس التزامنا بالجودة والخدمة.\n\nنركز على الابتكار وتحسين آلات البيع، مع الاهتمام بكل التفاصيل لضمان تميز منتجاتنا وأدائها في السوق. نقاط قوتنا: التصميم الإبداعي، المواد الممتازة، الإدارة الذكية، الجودة بأسعار معقولة، الخدمة الشاملة، والتحسين المستمر.',
  },
};

/* ── Six company strengths (user-specified) ── */
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

/* ── Key facts ── */
const NUMBERS: NumberItem[] = [
  { end: 11, suffix: '+', label: { en: 'Product categories', zh: '产品品类', ar: 'فئات المنتجات' } },
  { end: 60, suffix: '+', label: { en: 'Countries served', zh: '服务国家', ar: 'دول نخدمها' } },
  { end: 500, suffix: '+', label: { en: 'Global partners', zh: '全球合作伙伴', ar: 'شركاء عالميون' } },
  { end: 24, suffix: '/7', label: { en: 'Self-service operation', zh: '无人自助运营', ar: 'تشغيل ذاتي' } },
];

/* ── Manufacturing process cards (no watermarked photos) ── */
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

/* ── Mission statements (3 concrete commitments) ── */
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

/* ── Vision statements (3 aspirations) ── */
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

/* ── Global success stories (new V36 high-resolution images) ── */
const STORIES = [
  {
    image: '/images/cases/case-1.webp',
    title: { en: 'Fresh-Flower Kiosk', zh: '鲜花自助站', ar: 'كشك الزهور الطازجة' },
    sub: {
      en: 'On-demand bouquets for commuters and last-minute gifts.',
      zh: '为通勤族与临时送礼提供即时鲜花。',
      ar: 'باقات عند الطلب للركاب والهدايا في اللحظة الأخيرة.',
    },
  },
  {
    image: '/images/cases/case-2.webp',
    title: { en: '24/7 Campus Pizza', zh: '校园 24/7 披萨', ar: 'بيتزا الحرم الجامعي 24/7' },
    sub: {
      en: 'Serving students late-night on a European campus.',
      zh: '为欧洲校园师生提供深夜热食。',
      ar: 'تقديم الطعام الساخن لطلاب الحرم الجامعي في وقت متأخر.',
    },
  },
  {
    image: '/images/cases/case-3.webp',
    title: { en: 'Branded Ice-Cream Robot', zh: '品牌定制冰淇淋机器人', ar: 'روبوت آيس كريم بتصميم العلامة التجارية' },
    sub: {
      en: 'OEM branding for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制。',
      ar: 'تخصيص OEM لسلسلة بيع بالتجزئة في الشرق الأوسط.',
    },
  },
  {
    image: '/images/cases/case-4.webp',
    title: { en: 'Office Coffee Corner', zh: '办公室咖啡角', ar: 'مكتب قهوة المكاتب' },
    sub: {
      en: 'Energy-saving coffee in corporate lobbies.',
      zh: '企业大堂的节能咖啡方案。',
      ar: 'قهوة موفرة للطاقة في بهو الشركات.',
    },
  },
  {
    image: '/images/cases/case-5.webp',
    title: { en: 'Hospital Lobby', zh: '医院大堂', ar: 'بهو المستشفى' },
    sub: {
      en: 'Round-the-clock snacks and drinks for patients and visitors.',
      zh: '为患者与访客提供全天候零食与饮品。',
      ar: 'وجبات خفيفة ومشروبات على مدار الساعة للمرضى والزوار.',
    },
  },
  {
    image: '/images/cases/case-6.webp',
    title: { en: 'Pet Spa on the Street', zh: '街头宠物洗护站', ar: 'سبا للحيوانات في الشارع' },
    sub: {
      en: 'Self-service pet wash in a residential district.',
      zh: '社区中的自助宠物洗护。',
      ar: 'غسيل حيوانات ذاتي في حي سكني.',
    },
  },
];

/* ── Category tag per story ── */
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

/* ── Hero stat cards (under hero) ── */
const HERO_STATS = [
  { end: 11, suffix: '+', icon: Factory, key: 'hero.statCategories' },
  { end: 60, suffix: '+', icon: Globe2, key: 'hero.statCountries' },
  { end: 500, suffix: '+', icon: Users, key: 'hero.statPartners' },
  { end: 24, suffix: '/7', icon: Clock, key: 'hero.statService' },
];

/** Rotating accent identity for icon tiles & decorative lines. */
const ACCENTS = [
  { tile: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', border: 'border-cyan-400', glow: 'hover:shadow-cyan-500/30' },
  { tile: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', border: 'border-emerald-400', glow: 'hover:shadow-emerald-500/30' },
  { tile: 'from-violet-500 to-purple-500', text: 'text-violet-600', border: 'border-violet-400', glow: 'hover:shadow-violet-500/30' },
  { tile: 'from-amber-500 to-orange-500', text: 'text-amber-600', border: 'border-amber-400', glow: 'hover:shadow-amber-500/30' },
];

export default function AboutClient({ sections }: { sections: AboutSection[] }) {
  const { t, locale } = useLocale();

  const narrative = sections.filter((s) => s.key === 'story' || s.key === 'capability');

  const localeOr = <T extends string>(rec: Record<string, T>): T => (rec[locale] as T) ?? (rec.en as T);

  return (
    <div className="bg-gradient-to-b from-ocean-50/60 via-white to-brand-50/40">
      {/* ════════ 1. HERO ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-700 via-teal-600 to-sky-600 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -start-16 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute end-0 top-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden="true" />

        <div className="container-qtech relative py-20 text-center lg:py-28">
          <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            {t('about.badge') || 'About Qtech'}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{t('about.subtitle')}</p>

          {/* Brand-accent stat cards — horizontal, colour-rotated (no ci-pai) */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={s.key} delay={i * 80} className="h-full">
                  <div className="group relative flex h-full min-h-[160px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/40 bg-white/15 p-5 text-center shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent.tile} text-white shadow-md`}>
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <dt className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </dt>
                    <dd className="text-sm font-medium text-white/85">{t(s.key)}</dd>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ 1b. COMPANY INTRO ════════ */}
      <RevealOnScroll as="section" className="container-qtech py-16 lg:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-ocean-50/80 via-white to-brand-50/60 px-8 py-14 text-center shadow-soft lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {locale === 'zh' ? '关于 Qtech' : locale === 'ar' ? 'عن Qtech' : 'About Qtech'}
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
            {locale === 'zh' ? '欢迎来到 Qtech'
              : locale === 'ar' ? 'مرحبًا بكم في Qtech'
              : 'Welcome to Qtech'}
          </h2>
          <div className="prose-qtech mx-auto mt-6 max-w-3xl text-left">
            {COMPANY_INTRO.body[locale].split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
              <p key={i} className="mb-4 leading-relaxed text-ink-600">{p}</p>
            ))}
          </div>
          <Link href={`/${locale}/contact`} className="btn-primary mt-8">
            {t('nav.getQuote') || 'Get a Quote'}
          </Link>
        </div>
      </RevealOnScroll>

      {/* ════════ 2. OUR STRENGTHS (6 icon cards) ════════ */}
      <RevealOnScroll as="section" className="bg-cyan-50/50 py-16 lg:py-24">
        <div className="container-qtech">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700">
              <IconTile icon={ShieldCheck} className="h-4 w-4" tileClassName="bg-cyan-500 text-white p-1.5" />
              {locale === 'zh' ? '我们的优势' : locale === 'ar' ? 'نقاط قوتنا' : 'Our Strengths'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '六大核心竞争力'
                : locale === 'ar' ? 'ست نقاط قوة تنافسية'
                : 'Six Core Strengths'}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STRENGTHS.map((s, i) => {
              const Icon = s.icon;
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={localeOr(s.title)} delay={i * 80} className="h-full">
                  <div className="glass-card-strong group relative h-full">
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                    />
                    <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(s.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(s.desc)}</p>
                    <Link href={`/${locale}/products`} className={`mt-4 inline-flex items-center text-sm font-semibold ${a.text} hover:underline`}>
                      {locale === 'zh' ? '了解更多' : locale === 'ar' ? 'اعرف المزيد' : 'Learn more'} →
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ════════ 3. MISSION (3 statements) ─ cyan ambience ════════ */}
      <RevealOnScroll as="section" className="bg-cyan-50/50 py-16 lg:py-24">
        <div className="container-qtech">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700">
              <IconTile icon={Target} className="h-4 w-4" tileClassName="bg-cyan-500 text-white p-1.5" />
              {locale === 'zh' ? '我们的使命' : locale === 'ar' ? 'مهمتنا' : 'Our Mission'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '让智能自助真正创造价值'
                : locale === 'ar' ? 'جعل الخدمة الذاتية تخلق قيمة حقيقية'
                : 'Making Self-Service Create Real Value'}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MISSION_STATEMENTS.map((m, i) => {
              const Icon = m.icon;
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={localeOr(m.title)} delay={i * 80} className="h-full">
                  <div className="glass-card-strong group relative h-full animate-float-slow">
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                    />
                    <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(m.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(m.desc)}</p>
                    <Link href={`/${locale}/products`} className={`mt-4 inline-flex items-center text-sm font-semibold ${a.text} hover:underline`}>
                      {locale === 'zh' ? '了解更多' : locale === 'ar' ? 'اعرف المزيد' : 'Learn more'} →
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ════════ 4. VISION (3 statements) ─ emerald/violet/amber ambience ════════ */}
      <RevealOnScroll as="section" className="bg-teal-50/50 py-16 lg:py-24">
        <div className="container-qtech">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700">
              <IconTile icon={Globe2} className="h-4 w-4" tileClassName="bg-teal-500 text-white p-1.5" />
              {locale === 'zh' ? '我们的愿景' : locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '让世界随处可享智能服务'
                : locale === 'ar' ? 'لنجعل الخدمة الذكية في كل مكان'
                : 'Smart Service, Everywhere'}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VISION_STATEMENTS.map((v, i) => {
              const Icon = v.icon;
              const a = ACCENTS[(i + 1) % ACCENTS.length];
              return (
                <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                  <div className="glass-card-strong group relative h-full animate-float-slow">
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile} flow-bar`} aria-hidden="true" />
                    <IconTile
                      icon={Icon}
                      className="h-9 w-9"
                      tileClassName={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 icon-pulse ${a.glow}`}
                    />
                    <h3 className="mt-5 text-xl font-bold text-ink-900">{localeOr(v.title)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(v.desc)}</p>
                    <Link href={`/${locale}/contact`} className={`mt-4 inline-flex items-center text-sm font-semibold ${a.text} hover:underline`}>
                      {locale === 'zh' ? '了解更多' : locale === 'ar' ? 'اعرف المزيد' : 'Learn more'} →
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>

      {/* ════════ 5. STORY / CAPABILITY NARRATIVE (from DB, no images) ════════ */}
      <div className="container-qtech space-y-16 py-16 lg:py-24">
        {narrative.map((section, idx) => {
          const title = localized(section.title, locale);
          const body = localized(section.body, locale);
          const SectionIcon = SECTION_ICONS[section.key] || Factory;
          const a = ACCENTS[idx % ACCENTS.length];
          return (
            <RevealOnScroll
              key={section.key}
              as="section"
              className="grid items-center gap-10 lg:grid-cols-2"
            >
              <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${a.tile} px-4 py-1.5 text-sm font-medium text-white`}>
                  <IconTile icon={SectionIcon} className="h-4 w-4" tileClassName="bg-white/20 text-white p-1.5" />
                  {title}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
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
              <div className={`relative flex min-h-[260px] items-center justify-center rounded-2xl border border-ocean-200/60 bg-gradient-to-br from-ocean-50/60 to-white shadow-ocean ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <IconTile
                  icon={SectionIcon}
                  className="h-16 w-16"
                  tileClassName={`flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${a.tile} text-white shadow-xl`}
                />
              </div>
            </RevealOnScroll>
          );
        })}

        {/* ════════ 6. MANUFACTURING & QUALITY — icon cards, no watermarked photos ════════ */}
        <RevealOnScroll as="section" className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-brand-50 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700">
              <IconTile icon={Factory} className="h-4 w-4" tileClassName="bg-sky-500 text-white p-1.5" />
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
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={localeOr(card.title)} delay={i * 80} className="h-full">
                  <div className="glass-card-strong group flex h-full flex-col">
                    <div className="flex items-center gap-4">
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md transition-transform duration-300 group-hover:scale-110`} />
                      <h3 className="text-lg font-semibold text-ink-900">{localeOr(card.title)}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{localeOr(card.desc)}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
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
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 7. GLOBAL SUCCESS STORIES ════════ */}
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
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl pro-card transition-all duration-300 hover:scale-[1.03] hover:shadow-lift">
                    <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" />
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <ImageWithRetry
                        src={s.image}
                        alt={s.title[locale] || s.title.en}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
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

        {/* ════════ 8. CORE VALUES — 8-grid with colored top border ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-violet-50/50 via-white to-brand-50/40 px-8 py-14 lg:px-12">
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
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={localeOr(v.title)} delay={i * 80} className="h-full">
                  <div className={`glass-card-strong group relative flex h-full flex-col p-6 text-center border-t-4 ${a.border} animate-float-slow`}>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -end-2 -top-2 select-none text-6xl font-black text-slate-100/50"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <IconTile
                      icon={Icon}
                      className="h-7 w-7"
                      tileClassName={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md transition group-hover:scale-110 group-hover:shadow-lg icon-pulse`}
                    />
                    <h3 className="relative mt-4 text-lg font-bold text-ink-900">{localeOr(v.title)}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{localeOr(v.desc)}</p>
                    <Link href={`/${locale}/products`} className={`relative mt-4 inline-flex items-center justify-center text-sm font-semibold ${a.text} hover:underline`}>
                      {locale === 'zh' ? '了解更多' : locale === 'ar' ? 'اعرف المزيد' : 'Learn more'} →
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* ════════ 9. COMPANY TIMELINE — alternating vertical ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-cyan-50/60 via-white to-teal-50/50 px-8 py-14 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-cyan-100 px-4 py-1.5 text-sm font-medium text-cyan-700">
              {locale === 'zh' ? '发展历程' : locale === 'ar' ? 'رحلتنا الزمنية' : 'Our Journey'}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
              {locale === 'zh' ? '十年深耕，从广州走向世界'
                : locale === 'ar' ? 'عقد من الخبرة: من غوانغتشو إلى العالم'
                : 'A Decade of Excellence, From Guangzhou to the World'}
            </h2>
          </div>

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="absolute top-0 bottom-0 start-6 w-0.5 bg-gradient-to-b from-cyan-300 via-teal-300 to-sky-300 md:start-1/2 md:-translate-x-1/2" aria-hidden="true" />

            <div className="space-y-8">
              {TIMELINE.map((m, i) => {
                const left = i % 2 === 0;
                return (
                  <div key={m.year} className="relative ps-16 md:ps-0">
                    <div className="absolute start-0 top-1 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-[11px] font-bold text-white shadow-lg ring-4 ring-white md:start-1/2 md:-translate-x-1/2">
                      {m.year}
                    </div>
                    <div className="md:grid md:grid-cols-2 md:gap-10">
                      <div className={left ? 'md:col-start-1' : 'md:col-start-2'}>
                        <div className="glass-card-strong group relative">
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

        {/* ════════ 10. CERTIFICATIONS — icon grid ════════ */}
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
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <RevealOnScroll key={cert.name} delay={i * 60} className="h-full">
                  <div className="glass-card-strong group relative flex h-full flex-col items-center gap-2 p-5 text-center">
                    <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${a.tile}`} />
                    <IconTile icon={CertIcon} className="h-8 w-8" tileClassName={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${a.tile} text-white shadow-md transition-transform duration-300 group-hover:scale-110`} />
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

        {/* ════════ 11. CTA — gradient + two buttons ════════ */}
        <RevealOnScroll as="section" className="rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-sky-600 px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold drop-shadow-sm sm:text-4xl">{t('about.cta') || 'Ready to Partner with Qtech?'}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            {locale === 'zh'
              ? '联系我们获取定制报价与技术方案。'
              : locale === 'ar'
                ? 'تواصل معنا للحصول على عرض سعر مخصص وحلول تقنية.'
                : 'Contact us for custom quotes and technical solutions.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={`/${locale}/contact`} className="btn-primary">
              {t('nav.getQuote') || 'Get a Quote'}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20 active:scale-[0.97]"
            >
              {t('nav.products') || 'Products'}
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
