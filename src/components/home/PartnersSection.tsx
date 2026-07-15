'use client';

import { useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import type { Locale } from '@/lib/i18n';

interface Story {
  image: string;
  title: Record<Locale, string>;
  sub: Record<Locale, string>;
}

// Real deployment / application scenes built from existing product imagery.
const STORIES: Story[] = [
  {
    image:
      '/images/products/good-capacity-smart-locker-flower-vending-machine-selling-different-fresh-flowergift-in-subway/1.jpeg',
    title: {
      en: 'Subway Fresh-Flower Kiosk',
      zh: '地铁鲜花自助柜',
      ar: 'كشك الزهور الطازجة في المترو',
    },
    sub: {
      en: 'Deployed across metro stations in Southeast Asia.',
      zh: '已落地东南亚多个地铁站。',
      ar: 'تم نشره في محطات المترو في جنوب شرق آسيا.',
    },
  },
  {
    image:
      '/images/products/hot-food-pizza-vending-machine-self-service-selling-and-heating-pizza-bring-convenience-to-people/1.jpeg',
    title: {
      en: '24/7 Campus Pizza',
      zh: '校园 24/7 披萨',
      ar: 'بيتزا الحرم الجامعي 24/7',
    },
    sub: {
      en: 'Serving students late-night on a European campus.',
      zh: '为欧洲校园师生提供深夜热食。',
      ar: 'تقديم الطعام الساخن لطلاب الحرم الجامعي في وقت متأخر.',
    },
  },
  {
    image:
      '/images/products/different-flavor-robot-service-ice-cream-vending-machine-support-logo-customized/1.jpeg',
    title: {
      en: 'Branded Ice-Cream Robot',
      zh: '品牌定制冰淇淋机器人',
      ar: 'روبوت آيس كريم بتصميم العلامة التجارية',
    },
    sub: {
      en: 'OEM branding for a Middle-East retail chain.',
      zh: '为中东零售连锁提供 OEM 品牌定制。',
      ar: 'تخصيص OEM لسلسلة بيع بالتجزئة في الشرق الأوسط.',
    },
  },
  {
    image:
      '/images/products/2025-newest-instant-fast-hot-coffee-vending-machine-in-energy-saving-design/1.jpeg',
    title: {
      en: 'Office Coffee Corner',
      zh: '办公室咖啡角',
      ar: 'مكتب قهوة المكاتب',
    },
    sub: {
      en: 'Energy-saving coffee in corporate lobbies.',
      zh: '企业大堂的节能咖啡方案。',
      ar: 'قهوة موفرة للطاقة في بهو الشركات.',
    },
  },
  {
    image:
      '/images/products/fresh-sugarcane-orange-juice-vending-machine-24-hours-self-service-with-system/1.jpeg',
    title: {
      en: 'Juice Bar, Zero Staff',
      zh: '无人鲜榨果汁吧',
      ar: 'مفهوم عصير بلا موظفين',
    },
    sub: {
      en: 'Fresh juice vending in a beachside resort.',
      zh: '海滨度假村的鲜榨果汁售货。',
      ar: 'بيع عصير طازج في منتجع على الشاطئ.',
    },
  },
  {
    image:
      '/images/products/the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options/1.webp',
    title: {
      en: 'Pet Spa on the Street',
      zh: '街头宠物洗护站',
      ar: 'سبا للحيوانات في الشارع',
    },
    sub: {
      en: 'Self-service pet wash in a residential district.',
      zh: '社区中的自助宠物洗护。',
      ar: 'غسيل حيوانات ذاتي في حي سكني.',
    },
  },
];

const GAP = 24;

export default function PartnersSection() {
  const { t, locale } = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>('[data-card]');
    const cardW = first ? first.offsetWidth : el.clientWidth;
    el.scrollTo({ left: i * (cardW + GAP), behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>('[data-card]');
    if (!first) return;
    const idx = Math.round(el.scrollLeft / (first.offsetWidth + GAP));
    setActive(idx);
  };

  return (
    <section className="beach-section py-16 lg:py-20">
      <div className="container-qtech">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink-900">{t('home.partners.title')}</h2>
          <p className="mt-2 text-ink-500">{t('home.partners.subtitle')}</p>
        </div>

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="no-scrollbar mt-10 flex snap-x gap-6 overflow-x-auto pb-4"
        >
          {STORIES.map((s, i) => (
            <div
              key={i}
              data-card
              className="beach-card relative w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[340px]"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                <ImageWithRetry
                  src={s.image}
                  alt={s.title[locale] || s.title.en}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-ink-900">{s.title[locale] || s.title.en}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">{s.sub[locale] || s.sub.en}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-6 flex justify-center gap-2">
          {STORIES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${t('home.partners.title')} ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === active ? 'w-6 bg-coral-500' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
