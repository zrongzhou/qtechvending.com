/**
 * Single source of truth for the legacy site configuration.
 *
 * This used to live inside `seo.ts`, but `src/lib/data.ts` needs the same
 * fallback values for `getSiteSetting()` (DB is the source of truth, this is
 * the degrade-to-safe object). Splitting it out avoids a circular import
 * (data → seo → data). `seo.ts` re-exports it for backwards compatibility.
 */
export const SITE_CONFIG = {
  name: 'Qtech',
  company: 'Guangzhou Qiuyan Technology Co., Ltd.',
  defaultTitle: 'Qtech — Intelligent Vending & Fresh-Flower Automation Equipment',
  defaultTitleZh: 'Qtech — 智能售货与鲜花园艺自动化设备',
  defaultDescription:
    'Qtech (Guangzhou Qiuyan Technology) manufactures intelligent vending machines, fresh-flower vending, and automated garden equipment for global distributors and operators.',
  defaultDescriptionZh:
    'Qtech（广州秋彦科技）为全球经销商与运营商提供智能售货机、鲜花自动售货设备及自动化园艺设备。',
  keywords: [
    'vending machine', 'fresh flower vending', 'vending machine manufacturer',
    'self-service kiosk', 'automatic vending', 'Qtech', 'Qiuyan Technology',
    '智能售货机', '鲜花售货机', '自动售货设备', '广州秋彦科技',
    'ماكينة بيع', 'آلة بيع ذكية', 'آلة بيع الزهور',
  ],
  ogImage: '/images/og-default.svg',
  twitterHandle: '@qtechvending',
  sameAs: [
    'https://www.facebook.com/merin.zhou.7',
    'https://x.com/merinzhou?s=21',
    'https://www.youtube.com/@Qtechvending-VD',
    'https://www.tiktok.com/@qtechvending',
  ],
  email: 'info@qtechvending.com',
  phone: '+86 183 1975 3992',
  // English address used by the contact-info card / footer / map (legacy hardcode).
  addressLine: 'Room 1716-928, 17/F, Building 4, No. 388 Hanxi Avenue East, Nancun Town, Panyu District, Guangzhou, Guangdong, China',
};
