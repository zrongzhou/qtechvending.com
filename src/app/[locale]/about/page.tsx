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
    title: 'About Qtech Vending | Smart Vending Machine Manufacturer',
    description:
      'Qtech Vending is a smart vending machine manufacturer with 10+ years of experience, offering custom vending solutions for snacks, flowers, pizza, hot food, ice and more.',
    keywords: buildStaticPageKeywords(
      ['about Qtech', 'Qiuyan Technology', 'smart vending machine manufacturer', 'custom vending solutions', 'flower vending machine', 'pizza vending machine'],
      locale,
    ),
  });
}

// NOTE: English / Chinese copy is final. Arabic (ar) copy is AI-generated and
// still pending human review — TODO: ar 人工校对.
const DEFAULT_SECTIONS: AboutSection[] = [
  {
    key: 'story',
    title: { en: 'Who We Are', zh: '关于我们', ar: 'من نحن' },
    body: {
      en: 'Qtech Vending is a smart vending machine manufacturer with more than 10 years of experience in the automated retail industry. We started with traditional snack and drink vending machines and have continued to expand into flower vending machines, pizza vending machines, hot food vending machines, ice vending machines, fresh food machines, and customized vending solutions for different business needs.\n\nWe understand that customers are not just buying a machine. They are looking for a reliable way to extend business hours, reduce labor costs, improve customer convenience, and create new sales opportunities. That is why we focus on practical solutions based on what customers want to sell, where the machine will be used, how users will pay, and how the business will operate.\n\nWith a customer-centered mindset, Qtech Vending continues to improve product quality, user experience, payment systems, remote management, and customization options. We aim to help operators, retailers, distributors, and venue owners build smart, flexible, and profitable 24/7 self-service businesses.',
      zh: 'Qtech Vending 是一家拥有 10 余年经验的智能售货机厂家，深耕自动零售行业。我们从传统零食饮料售货机起步，持续拓展到鲜花售货机、披萨售货机、热食售货机、制冰售货机、鲜食售货机，以及面向不同业务场景的定制售货方案。\n\n我们深知，客户买的不仅是一台机器，而是一套可靠的经营方式——延长营业时间、降低人工成本、提升顾客便利、创造新的销售机会。因此，我们始终围绕客户想卖什么、机器用在哪、用户怎么付款、生意如何运营，提供务实可落地的方案。\n\n秉持以客户为中心的理念，Qtech Vending 持续优化产品质量、用户体验、支付系统、远程管理与定制能力，助力运营商、零售商、经销商与场地方打造灵活、智能、可盈利的 24/7 自助生意。',
      ar: 'Qtech Vending هي شركة مصنعة لآلات البيع الذكية بخبرة تزيد عن 10 سنوات في صناعة التجزئة الآلية. بدأنا بآلات بيع الوجبات الخفيفة والمشروبات التقليدية وتوسعنا إلى آلات بيع الزهور والبيتزا والطعام الساخن والثلج والأطعمة الطازجة وحلول البيع المخصصة لمختلف الاحتياجات التجارية.\n\nنحن ندرك أن العملاء لا يشترون مجرد آلة، بل يبحثون عن طريقة موثوقة لإطالة ساعات العمل، وتقليل تكاليف العمالة، وتحسين راحة العملاء، وخلق فرص مبيعات جديدة. لذلك نركز على حلول عملية تستند إلى ما يريد العملاء بيعه، وأين سيُستخدم الجهاز، وكيف يدفع المستخدمون، وكيف تدار الأعمال.\n\nومع عقلية تركز على العميل، تواصل Qtech Vending تحسين جودة المنتج، وتجربة المستخدم، وأنظمة الدفع، والإدارة عن بُعد، وخيارات التخصيص، بهدف مساعدة المشغلين والتجار والموزعين وأصحاب المواقع على بناء أعمال خدمة ذاتية ذكية ومرنة ومربحة على مدار 24/7.',
    },
  },
  {
    key: 'mission',
    title: { en: 'Our Mission', zh: '我们的使命', ar: 'مهمتنا' },
    body: {
      en: 'To make intelligent self-service equipment accessible and profitable for operators everywhere — through factory-direct pricing, customization, and dependable support.',
      zh: '通过工厂直供的价格、定制化能力与可靠的支持，让全球运营商都能用上并受益于智能自助设备。',
      ar: 'جعل معدات الخدمة الذاتية الذكية متاحة ومربحة للمشغلين في كل مكان — من خلال أسعار مباشرة من المصنع والتخصيص ودعم موثوق.',
    },
  },
  {
    key: 'vision',
    title: { en: 'Our Vision', zh: '我们的愿景', ar: 'رؤيتنا' },
    body: {
      en: 'To be the most trusted partner for intelligent self-service equipment — helping businesses of every size turn any space into a 24/7, automated retail and service point.',
      zh: '成为最值得信赖的智能自助设备伙伴——帮助各种规模的企业，将任意空间变为 24/7 的自动化零售与服务触点。',
      ar: 'أن نكون الشريك الأكثر موثوقية لمعدات الخدمة الذاتية الذكية — ومساعدة الأعمال بكل أحجامها على تحويل أي مساحة إلى نقطة بيع وخدمة آلية على مدار الساعة.',
    },
  },
  {
    key: 'capability',
    title: { en: 'Why Choose Us', zh: '为什么选择我们', ar: 'لماذا تختارنا' },
    body: {
      en: 'Qtech Vending has more than 10 years of manufacturing experience in the vending machine industry. We understand that customers need more than a machine. They need a reliable solution that fits their product, location, payment method and business model.\n\nOur R&D team supports customized vending machine projects, including cabinet design, product layout, payment systems, software functions and branding. From sheet metal materials to assembly and testing, we follow strict QC control to reduce machine failure rates and improve long-term operation.\n\nWith our own sheet metal factory, we can better control production quality, delivery schedule and cost. This allows us to offer competitive pricing, usually about 3% lower than many comparable market options, while still keeping the machine reliable and practical for real business use.',
      zh: 'Qtech Vending 在售货机行业拥有 10 余年制造经验。我们深知客户需要的不仅是一台机器，而是一套契合产品、场地、支付方式与商业模式的可靠方案。\n\n我们的研发团队支持各类定制售货机项目，涵盖机柜设计、商品布局、支付系统、软件功能与品牌定制。从钣金选材到装配测试，全程严格品控，降低故障率、保障长期稳定运行。\n\n依托自有钣金工厂，我们能更好地把控品质、交期与成本，从而在保证机器可靠实用的前提下，提供通常比同类市场方案低约 3% 的更具竞争力价格。',
      ar: 'تمتلك Qtech Vending أكثر من 10 سنوات من خبرة التصنيع في صناعة آلات البيع. ندرك أن العملاء يحتاجون إلى أكثر من مجرد آلة، بل إلى حل موثوق يناسب منتجهم وموقعهم وطريقة الدفع ونموذج أعمالهم.\n\nيدعم فريق البحث والتطوير لدينا مشاريع آلات البيع المخصصة، بما في ذلك تصميم الخزانة وتخطيط المنتج وأنظمة الدفع ووظائف البرمجيات والعلامة التجارية. من مواد الصاج إلى التجميع والاختبار، نتبع ضبط جودة صارمًا لتقليل معدلات الأعطال وتحسين التشغيل على المدى الطويل.\n\nوبفضل مصنع الصاج الخاص بنا، يمكننا التحكم بشكل أفضل في جودة الإنتاج وجدول التسليم والتكلفة، مما يتيح لنا تقديم أسعار تنافسية أقل بنحو 3% من العديد من الخيارات المماثلة في السوق، مع الحفاظ على موثوقية الآلة وعملية استخدامها في الأعمال الحقيقية.',
    },
  },
];

export default async function AboutPage() {
  const info = await getCompanyInfo();
  const sections: AboutSection[] =
    info && info.sections.length ? info.sections : DEFAULT_SECTIONS;

  return <AboutClient sections={sections} />;
}
