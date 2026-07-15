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
  'all-machines': '/images/categories/all-machines.png',
  'fresh-flower-vending-machine': '/images/categories/fresh-flower-vending-machine.png',
  'pizza-vending-machine': '/images/categories/pizza-vending-machine.png',
  'cotton-candy-machine': '/images/categories/cotton-candy-machine.png',
  'fruit-vegetable-egg-vending-machine': '/images/categories/fruit-vegetable-egg-vending-machine.png',
  'sugar-cane-juice-vending-machine': '/images/categories/sugar-cane-juice-vending-machine.png',
  'ice-maker-vending-machine': '/images/categories/ice-maker-vending-machine.png',
  'coffee-vending-machine': '/images/categories/coffee-vending-machine.png',
  'ice-cream-vending-machine': '/images/categories/ice-cream-vending-machine.png',
  'pet-washing-machine': '/images/categories/pet-washing-machine.png',
  'food-vending-machine': '/images/categories/food-vending-machine.png',
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

      <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
