import type { ComponentType } from 'react';
import { Factory, Package, Cpu, HeartPulse, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

export interface Solution {
  /** Stable identifier used as React key and for anchors. */
  id: string;
  /** Lucide icon rendered in the card header. */
  icon: ComponentType<{ className?: string }>;
  /** Localized card title. */
  title: Record<Locale, string>;
  /** Localized one-paragraph description. */
  description: Record<Locale, string>;
  /** Localized bullet points (each a separate i18n field). */
  features: Record<Locale, string>[];
  /** Internal route the card links to. */
  href: string;
}

/**
 * Six flagship solution scenarios Qtech serves. Content is kept as localized
 * records (shaped { en, zh, ar }) so every locale stays in parity without
 * depending on the flat i18n message files.
 */
export const SOLUTIONS: Solution[] = [
  {
    id: 'factory-tools',
    icon: Factory,
    title: {
      en: 'Smart Factory Tool Management',
      zh: '智能工厂工具管理',
      ar: 'إدارة أدوات المصنع الذكية',
    },
    description: {
      en: 'Intelligent lockers and vending for tools, consumables and PPE on the shop floor — tracked, audited and available 24/7.',
      zh: '面向车间的智能工具柜与售货系统，对工具、耗材与劳保用品进行追踪、审计，全天候可用。',
      ar: 'خزائن وآلات بيع ذكية للأدوات والمستهلكات ومعدات السلامة في ورش العمل — متتبَّعة ومراجَعة ومتاحة على مدار الساعة.',
    },
    features: [
      { en: 'RFID / PIN controlled access', zh: 'RFID / 密码 访问控制', ar: 'وصول مُتحكم به عبر RFID / رمز' },
      { en: 'Automatic usage & inventory logs', zh: '自动记录领用与库存', ar: 'سجلات استخدام ومخزون تلقائية' },
      { en: 'Low-stock alerts to procurement', zh: '低库存自动提醒采购', ar: 'تنبيهات نقص المخزون للمشتريات' },
    ],
    href: '/products',
  },
  {
    id: 'office-stationery',
    icon: Package,
    title: {
      en: 'Office Stationery Vending',
      zh: '办公文具售货',
      ar: 'بيع القرطاسية للمكاتب',
    },
    description: {
      en: 'Self-service stations for pens, notebooks and supplies so teams never run out — no more manual requisitions.',
      zh: '自助补给站提供笔、笔记本等办公耗材，团队随时取用，告别繁琐的手动申领。',
      ar: 'محطات ذاتية لمنتجات مثل الأقلام والدفاتر بحيث لا ينفد المخزون أبدًا — دون طلبات يدوية.',
    },
    features: [
      { en: 'Compact floor-standing design', zh: '小巧立式机身', ar: 'تصميم عمودي مدمج' },
      { en: 'Cashless & staff-card payment', zh: '无现金与员工卡支付', ar: 'دفع بدون نقد وبطاقة الموظف' },
      { en: 'Restock reports by SKU', zh: '按 SKU 补货报表', ar: 'تقارير إعادة التخزين حسب المنتج' },
    ],
    href: '/products',
  },
  {
    id: 'electronic-components',
    icon: Cpu,
    title: {
      en: 'Electronic Component Storage',
      zh: '电子元器件存储',
      ar: 'تخزين المكونات الإلكترونية',
    },
    description: {
      en: 'Climate-aware storage and vending for sensitive components, with ESD-safe handling and full traceability.',
      zh: '为敏感元器件提供恒温存储与售货，具备静电防护处理与全程可追溯。',
      ar: 'تخزين وبيع للمكونات الحساسة مع بيئة مناسبة وتعامل آمن من التفريغ الكهربائي وتتبع كامل.',
    },
    features: [
      { en: 'ESD-safe compartments', zh: '防静电隔间', ar: 'أقسام آمنة من التفريغ الكهربائي' },
      { en: 'Per-user issue tracking', zh: '按人员发放追踪', ar: 'تتبع الصرف لكل مستخدم' },
      { en: 'Audit-ready export logs', zh: '可审计导出日志', ar: 'سجلات تصدير جاهزة للمراجعة' },
    ],
    href: '/products',
  },
  {
    id: 'medical-supply',
    icon: HeartPulse,
    title: {
      en: 'Medical Supply Vending',
      zh: '医疗物资售货',
      ar: 'بيع المستلزمات الطبية',
    },
    description: {
      en: 'Secure, hygienic dispensing of PPE, kits and consumables for clinics, labs and care facilities.',
      zh: '为诊所、实验室与护理机构提供安全、卫生的防护用品、套装与耗材发放。',
      ar: 'صرف آمن ونظيف لمعدات السلامة والحقائب والمستهلكات للعيادات والمختبرات ومرافق الرعاية.',
    },
    features: [
      { en: 'Hygienic touchless pickup', zh: '卫生无接触取货', ar: 'استلام نظيف دون تلامس' },
      { en: 'Access-controlled by role', zh: '按角色权限控制', ar: 'وصول مُتحكم به حسب الدور' },
      { en: 'Expiry & batch monitoring', zh: '效期与批次监控', ar: 'مراقبة الصلاحية والدفعات' },
    ],
    href: '/products',
  },
  {
    id: 'food-beverage',
    icon: UtensilsCrossed,
    title: {
      en: 'Food & Beverage Vending',
      zh: '餐饮食品售货',
      ar: 'بيع الطعام والمشروبات',
    },
    description: {
      en: 'Our core line — fresh-flower, pizza, coffee, juice and snack machines engineered for reliable 24/7 operation.',
      zh: '我们的核心产品线——鲜花、披萨、咖啡、果汁与零食售货机，为 24/7 稳定运营而打造。',
      ar: 'خطنا الأساسي — آلات بيع الزهور والبيتزا والقهوة والعصير والوجبات الخفيفة المصممة لتشغيل موثوق على مدار الساعة.',
    },
    features: [
      { en: 'Refrigerated & heated options', zh: '冷藏与加热可选', ar: 'خيارات مبردة وساخنة' },
      { en: 'Cashless multi-currency POS', zh: '无现金多币种收银', ar: 'نقطة بيع متعددة العملات بدون نقد' },
      { en: 'Remote telemetry & alerts', zh: '远程监控与告警', ar: 'مراقبة وتنبيهات عن بُعد' },
    ],
    href: '/products',
  },
  {
    id: 'ppe-safety',
    icon: ShieldCheck,
    title: {
      en: 'PPE & Safety Equipment',
      zh: '劳保与安全装备',
      ar: 'معدات السلامة والوقاية',
    },
    description: {
      en: 'On-demand dispensing of helmets, gloves, glasses and protective gear to keep every site compliant.',
      zh: '按需发放安全帽、手套、护目镜与防护装备，确保各作业现场合规。',
      ar: 'صرف عند الطلب للخوذات والقفازات والنظارات ومعدات الوقاية لإبقاء كل موقع متوافقًا.',
    },
    features: [
      { en: 'Must-issue safety kits', zh: '强制发放安全套装', ar: 'حقائب سلامة إلزامية' },
      { en: 'Site & shift-based rules', zh: '按工地与班次规则', ar: 'قواعد حسب الموقع والوردية' },
      { en: 'Compliance dashboards', zh: '合规看板', ar: 'لوحات امتثال' },
    ],
    href: '/products',
  },
];
