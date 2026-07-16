'use client';

import { useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
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
      '/images/products/the-hot-new-pet-intelligent-self-service-washing-and-grooming-vending-machine-with-convenient-payment-options/1.jpeg',
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

export default function PartnersSection() {
  const { t, locale } = useLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-card]');
    const target = cards[i];
    if (target) {
      // direction-agnostic: aligns the card's inline-start edge to the
      // container's inline-start edge, which is correct for both LTR and RTL.
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'));
    if (!cards.length) return;
    const dir = getComputedStyle(el).direction;
    const containerEdge = dir === 'rtl' ? el.getBoundingClientRect().right : el.getBoundingClientRect().left;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, idx) => {
      const r = c.getBoundingClientRect();
      const edge = dir === 'rtl' ? r.right : r.left;
      const dist = Math.abs(edge - containerEdge);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    setActive(best);
  };

  return (
    <RevealOnScroll as="section" className="bg-brand-50 py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.partners.eyebrow')}</p>
          <h2 className="section-title">{t('home.partners.title')}</h2>
          <p className="section-subtitle">{t('home.partners.subtitle')}</p>
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
              className="group pro-card relative w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[340px]"
            >
              {/* Brand top accent bar — aligns with card design system */}
              <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-brand-400 to-brand-700" />
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <ImageWithRetry
                  src={s.image}
                  alt={s.title[locale] || s.title.en}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                {/* Subtle depth scrim on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                  {s.title[locale] || s.title.en}
                </h3>
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
                i === active ? 'w-6 bg-brand-600' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </RevealOnScroll>
  );
}
