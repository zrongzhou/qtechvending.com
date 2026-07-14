import type { Locale } from '@/lib/i18n';

export interface FaqItem {
  question: Record<Locale, string>;
  answer: Record<Locale, string>;
}

export interface FaqCategory {
  /** Stable identifier used as React key and for open-state tracking. */
  id: string;
  /** Localized category heading. */
  title: Record<Locale, string>;
  items: FaqItem[];
}

/**
 * Frequently-asked-questions content grouped into three categories. All copy is
 * kept as localized records ({ en, zh, ar }) so the three locales stay in parity.
 */
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'general',
    title: {
      en: 'General',
      zh: '常见问题',
      ar: 'عام',
    },
    items: [
      {
        question: {
          en: 'What types of vending machines does Qtech manufacture?',
          zh: 'Qtech 制造哪些类型的售货机？',
          ar: 'ما أنواع آلات البيع التي تصنعها Qtech؟',
        },
        answer: {
          en: 'We build fresh-flower, pizza, coffee, juice, ice-cream, pet-wash and food vending machines, plus smart lockers and automated kiosks for a wide range of markets.',
          zh: '我们制造鲜花、披萨、咖啡、果汁、冰淇淋、宠物洗护与食品售货机，以及面向各类市场的智能柜与自动化终端。',
          ar: 'نصنع آلات بيع الزهور والبيتزا والقهوة والعصير والآيس كريم وغسيل الحيوانات والطعام، بالإضافة إلى خزائن ذكية وأكشاك آلية لمجموعة واسعة من الأسواق.',
        },
      },
      {
        question: {
          en: 'Which countries do you ship to?',
          zh: '你们向哪些国家发货？',
          ar: 'إلى أي دول تقوم بالشحن؟',
        },
        answer: {
          en: 'We export to 60+ countries across Asia, Europe, the Middle East, Africa and the Americas, with experience in both LCL and full-container shipping.',
          zh: '我们向亚洲、欧洲、中东、非洲与美洲的 60 多个国家出口，具备拼箱与整柜运输经验。',
          ar: 'نصدّر إلى أكثر من 60 دولة في آسيا وأوروبا والشرق الأوسط وأفريقيا والأمريكتين، مع خبرة في الشحن المجمّع والحاويات الكاملة.',
        },
      },
      {
        question: {
          en: 'Do you support OEM and branding?',
          zh: '你们支持 OEM 与品牌定制吗？',
          ar: 'هل تدعمون تصنيع OEM والعلامة التجارية؟',
        },
        answer: {
          en: 'Yes. We offer OEM, private-label and software customization including logo, UI language, payment methods and cabinet wrap.',
          zh: '支持。我们提供 OEM、贴牌与软件定制，包括 Logo、界面语言、支付方式与机身外观。',
          ar: 'نعم. نوفر تصنيع OEM والعلامة الخاصة وتخصيص البرمجيات بما في ذلك الشعار ولغة الواجهة وطرق الدفع وتغليف الهيكل.',
        },
      },
      {
        question: {
          en: 'What languages does your support cover?',
          zh: '你们的支持覆盖哪些语言？',
          ar: 'ما اللغات التي يغطيها الدعم لديكم؟',
        },
        answer: {
          en: 'Sales and technical support are available in English, Chinese and Arabic.',
          zh: '销售与技术支持提供中文、英文与阿拉伯语服务。',
          ar: 'يتوفر الدعم في المبيعات والدعم الفني باللغات الإنجليزية والصينية والعربية.',
        },
      },
    ],
  },
  {
    id: 'technical',
    title: {
      en: 'Technical',
      zh: '技术与运维',
      ar: 'تقني',
    },
    items: [
      {
        question: {
          en: 'What payment methods are supported?',
          zh: '支持哪些支付方式？',
          ar: 'ما طرق الدفع المدعومة؟',
        },
        answer: {
          en: 'Our machines support cashless payments (card, QR, NFC) and can be configured for local wallets and multi-currency POS.',
          zh: '我们的设备支持无现金支付（刷卡、扫码、NFC），并可按本地钱包与多币种收银配置。',
          ar: 'تدعم آلاتنا الدفع بدون نقد (بطاقة، رمز QR، NFC) ويمكن تهيئتها للمحافظ المحلية ونقاط بيع متعددة العملات.',
        },
      },
      {
        question: {
          en: 'How are machines connected and monitored?',
          zh: '设备如何联网与监控？',
          ar: 'كيف يتم توصيل الآلات ومراقبتها؟',
        },
        answer: {
          en: 'Machines use 4G / Wi-Fi with a remote management platform for stock, sales telemetry, fault alerts and OTA updates.',
          zh: '设备通过 4G / Wi-Fi 联网，配合远程管理平台实现库存、销售遥测、故障告警与 OTA 升级。',
          ar: 'تستخدم الآلات 4G / Wi-Fi مع منصة إدارة عن بُعد للمخزون وقياس المبيعات وتنبيهات الأعطال والتحديثات الهوائية.',
        },
      },
      {
        question: {
          en: 'Can machines operate outdoors or in hot climates?',
          zh: '设备能在户外或炎热气候下运行吗？',
          ar: 'هل يمكن للآلات العمل في الهواء الطلق أو في المناخ الحار؟',
        },
        answer: {
          en: 'Yes — models include climate control, anti-theft enclosures and UV / weather protection for demanding environments.',
          zh: '可以——相关机型配备温控、防盗机箱与紫外线/防候保护，适用于严苛环境。',
          ar: 'نعم — تشمل الطرز التحكم بالمناخ وأغلفة مضادة للسرقة وحماية من الأشعة فوق البنفسجية والطقس للبيئات القاسية.',
        },
      },
      {
        question: {
          en: 'What is the typical lead time?',
          zh: '通常的交货周期是多久？',
          ar: 'ما هو وقت التسليم النموذجي؟',
        },
        answer: {
          en: 'Standard models ship in 2–4 weeks; customized OEM orders typically take 4–8 weeks depending on configuration.',
          zh: '标准机型 2–4 周发货；定制 OEM 订单通常 4–8 周，视配置而定。',
          ar: 'تُشحن الطرز القياسية خلال 2–4 أسابيع؛ وتستغرق طلبات OEM المخصصة عادة 4–8 أسابيع حسب التهيئة.',
        },
      },
    ],
  },
  {
    id: 'order-support',
    title: {
      en: 'Order & Support',
      zh: '下单与支持',
      ar: 'الطلب والدعم',
    },
    items: [
      {
        question: {
          en: 'How do I request a quote?',
          zh: '如何获取报价？',
          ar: 'كيف أطلب عرض سعر؟',
        },
        answer: {
          en: 'Use the Contact page to tell us your market, target products and quantity — we reply with a factory-direct quote within 24 hours.',
          zh: '通过联系页面告知您的市场、目标产品与数量，我们将在 24 小时内提供工厂直供报价。',
          ar: 'استخدم صفحة الاتصال لإخبارنا بسوقك والمنتجات المستهدفة والكمية — ونرد بعرض سعر مباشر من المصنع خلال 24 ساعة.',
        },
      },
      {
        question: {
          en: 'What about warranty and after-sales?',
          zh: '保修与售后如何？',
          ar: 'ماذا عن الضمان وما بعد البيع؟',
        },
        answer: {
          en: 'We provide a standard warranty with remote diagnostics, spare parts and technical guidance; extended plans are available.',
          zh: '我们提供标准保修，含远程诊断、备件与技术指导；可延长保修方案。',
          ar: 'نوفر ضمانًا قياسيًا مع تشخيص عن بُعد وقطع غيار وإرشادات فنية؛ وتتوفر خطط ممددة.',
        },
      },
      {
        question: {
          en: 'Can I become a distributor?',
          zh: '我可以成为经销商吗？',
          ar: 'هل يمكنني أن أصبح موزعًا؟',
        },
        answer: {
          en: 'Absolutely. We partner with distributors and operators worldwide — contact us with your region and we will share the program details.',
          zh: '当然可以。我们与全球经销商及运营商合作——请告知所在区域，我们将分享合作方案详情。',
          ar: 'بالتأكيد. نتعاون مع الموزعين والمشغلين حول العالم — تواصلوا معنا مع منطقتكم وسنشارك تفاصيل البرنامج.',
        },
      },
    ],
  },
];
