'use client';

import Link from 'next/link';
import {
  Factory,
  Flower2,
  Pizza,
  Candy,
  Egg,
  CupSoda,
  Snowflake,
  Coffee,
  IceCream,
  PawPrint,
  UtensilsCrossed,
} from 'lucide-react';
import { type ComponentType } from 'react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

// Map each category slug to a lucide icon. Cards use a cohesive brand-tinted
// glass surface (no per-card rainbow gradients) to keep the look premium.
const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  'all-machines': Factory,
  'fresh-flower-vending-machine': Flower2,
  'pizza-vending-machine': Pizza,
  'cotton-candy-machine': Candy,
  'fruit-vegetable-egg-vending-machine': Egg,
  'sugar-cane-juice-vending-machine': CupSoda,
  'ice-maker-vending-machine': Snowflake,
  'coffee-vending-machine': Coffee,
  'ice-cream-vending-machine': IceCream,
  'pet-washing-machine': PawPrint,
  'food-vending-machine': UtensilsCrossed,
};

// Banner photo per category slug (generated visuals in public/images/categories).
const IMAGE_MAP: Record<string, string> = {
  'all-machines': '/images/categories/all-machines.webp',
  'fresh-flower-vending-machine': '/images/categories/fresh-flower-vending-machine.webp',
  'pizza-vending-machine': '/images/categories/pizza-vending-machine.webp',
  'cotton-candy-machine': '/images/categories/cotton-candy-machine.webp',
  'fruit-vegetable-egg-vending-machine': '/images/categories/fruit-vegetable-egg-vending-machine.webp',
  'sugar-cane-juice-vending-machine': '/images/categories/sugar-cane-juice-vending-machine.webp',
  'ice-maker-vending-machine': '/images/categories/ice-maker-vending-machine.webp',
  'coffee-vending-machine': '/images/categories/coffee-vending-machine.webp',
  'ice-cream-vending-machine': '/images/categories/ice-cream-vending-machine.webp',
  'pet-washing-machine': '/images/categories/pet-washing-machine.webp',
  'food-vending-machine': '/images/categories/food-vending-machine.webp',
};

export default function CategoriesGrid({
  categories,
  counts = {},
}: {
  categories: Category[];
  counts?: Record<string, number>;
}) {
  const { t, locale } = useLocale();
  if (!categories.length) return null;

  return (
    <section className="container-qtech bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-ink-900">{t('home.categories.title')}</h2>
        <p className="mt-2 text-ink-500">{t('home.categories.subtitle')}</p>
      </div>

      <div className="mt-10 grid snap-x gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:snap-none">
        {categories.map((cat) => {
          const name = localized(cat.name, locale);
          const description = cat.description ? localized(cat.description, locale) : '';
          const Icon = ICON_MAP[cat.slug] || Factory;
          const img = IMAGE_MAP[cat.slug];
          const count = counts[cat.slug] ?? 0;

          return (
            <Link
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className="group relative flex min-w-[260px] snap-start flex-col overflow-hidden rounded-2xl glass-card p-0 transition hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
            >
              {/* Banner image with gradient overlay */}
              <div className="relative h-36 w-full overflow-hidden">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/20 to-transparent" />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-brand-600 shadow-md backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-ink-900">{name}</h3>
                {description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{description}</p>}
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-brand-600">
                  {count} {t('home.categories.productCount')}
                  <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </Link>
          );
        })}

        {/* Filler CTA card when categories don't fill the last row */}
        {categories.length % 4 !== 0 && (
          <Link
            href={`/${locale}/products`}
            className="group flex min-w-[260px] snap-start flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50 to-cyan-50 p-0 transition hover:border-brand-500 hover:-translate-y-1 hover:shadow-lg sm:min-w-0"
          >
            <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-800">{locale === 'zh' ? '浏览全部设备' : locale === 'ar' ? 'عرض جميع المعدات' : 'Browse All Machines'}</p>
                <p className="mt-0.5 text-xs text-brand-500">{categories.length} {t('home.categories.productCount')}</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
