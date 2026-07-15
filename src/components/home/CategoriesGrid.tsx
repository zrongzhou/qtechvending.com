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
          const count = counts[cat.slug] ?? 0;

          return (
            <Link
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className="group relative flex min-w-[260px] snap-start flex-col overflow-hidden rounded-2xl glass-card p-6 transition hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink-900">{name}</h3>
              {description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{description}</p>}
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                {count} {t('home.categories.productCount')}
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
