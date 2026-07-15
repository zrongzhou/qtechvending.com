import type { Metadata } from 'next';
import AboutClient, { type AboutSection } from './AboutClient';
import { getCompanyInfo } from '@/lib/data';
import { generatePageMetadata, SITE_CONFIG } from '@/lib/seo';
import { buildStaticPageKeywords } from '@/lib/seo-keywords';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return generatePageMetadata({
    path: '/about',
    title: 'About',
    description: SITE_CONFIG.defaultDescription,
    keywords: buildStaticPageKeywords(['about Qtech', 'Qiuyan Technology'], locale),
  });
}

// NOTE: English / Chinese copy is final. Arabic (ar) copy is AI-generated and
// still pending human review — TODO: ar 人工校对.
const DEFAULT_SECTIONS: AboutSection[] = [
  {
    key: 'story',
    title: { en: 'Who We Are', zh: '关于我们', ar: 'من نحن' },
    body: {
      en: 'Guangzhou Qiuyan Technology Co., Ltd. (brand: Qtech) is a manufacturer of intelligent vending and fresh-flower / garden automation equipment, serving global distributors and operators.\n\nWe combine in-house R&D, a Guangzhou production base, and export experience to deliver reliable self-service machines tailored to each market.',
      zh: '广州秋彦科技有限公司（品牌：Qtech）是一家智能售货与鲜花园艺自动化设备制造商，服务于全球经销商与运营商。\n\n我们拥有自主研发能力与广州生产基地，并以丰富的出口经验，为各个市场提供可靠的无人自助设备。',
      ar: 'شركة قوانغتشو تشيويان للتكنولوجيا (العلامة التجارية: Qtech) هي شركة تصنيع لأجهزة البيع الذكية ومعدات أتمتة الزهور والحدائق، وتخدم الموزعين والمشغلين حول العالم.\n\nنجمع بين البحث والتطوير الداخلي وقاعدة إنتاج في غوانغتشو وخبرة التصدير لتقديم آلات خدمة ذاتية موثوقة مخصصة لكل سوق.',
    },
    image: '/images/about/company.svg',
  },
  {
    key: 'mission',
    title: { en: 'Our Mission', zh: '我们的使命', ar: 'مهمتنا' },
    body: {
      en: 'To make intelligent self-service equipment accessible and profitable for operators everywhere — through factory-direct pricing, customization, and dependable support.',
      zh: '通过工厂直供的价格、定制化能力与可靠的支持，让全球运营商都能用上并受益于智能自助设备。',
      ar: 'جعل معدات الخدمة الذاتية الذكية متاحة ومربحة للمشغلين في كل مكان — من خلال أسعار مباشرة من المصنع والتخصيص ودعم موثوق.',
    },
    image: '/images/about/mission.svg',
  },
  {
    key: 'vision',
    title: { en: 'Our Vision', zh: '我们的愿景', ar: 'رؤيتنا' },
    body: {
      en: 'To be the most trusted partner for intelligent self-service equipment — helping businesses of every size turn any space into a 24/7, automated retail and service point.',
      zh: '成为最值得信赖的智能自助设备伙伴——帮助各种规模的企业，将任意空间变为 24/7 的自动化零售与服务触点。',
      ar: 'أن نكون الشريك الأكثر موثوقية لمعدات الخدمة الذاتية الذكية — ومساعدة الأعمال بكل أحجامها على تحويل أي مساحة إلى نقطة بيع وخدمة آلية على مدار الساعة.',
    },
    image: '/images/about/vision.svg',
  },
  {
    key: 'capability',
    title: { en: 'What We Do', zh: '我们的业务', ar: 'ماذا نقدم' },
    body: {
      en: 'We design and manufacture fresh-flower, food, beverage and specialty vending machines, plus smart lockers and automated kiosks — all backed by in-house R&D, OEM customization and global logistics.',
      zh: '我们设计制造鲜花、食品、饮品与特种售货机，以及智能柜与自动化终端——全部依托自主研发、OEM 定制与全球物流支持。',
      ar: 'نصمم ونصنع آلات بيع الزهور والطعام والمشروبات والمتخصصة، بالإضافة إلى خزائن ذكية وأكشاك آلية — بدعم من البحث والتطوير الداخلي وتخصيص OEM واللوجستيات العالمية.',
    },
    image: '/images/about/capabilities.svg',
  },
];

export default async function AboutPage() {
  const info = await getCompanyInfo();
  const sections: AboutSection[] =
    info && info.sections.length ? info.sections : DEFAULT_SECTIONS;

  return <AboutClient sections={sections} />;
}
