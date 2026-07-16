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
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

// Map each category slug to a lucide icon. Cards use a cohesive brand-tinted
// glass surface (no per-card rainbow gradients) to keep the look premium.
const ICON_MAP: Record<string, LucideIcon> = {
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
    <section id="machines" className="bg-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="section-head">
          <p className="eyebrow">{t('home.categories.eyebrow')}</p>
          <h2 className="section-title">{t('home.categories.title')}</h2>
          <p className="section-subtitle">{t('home.categories.subtitle')}</p>
        </div>

        <div className="mt-10 grid snap-x gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:snap-none">
          {categories.slice(0, 8).map((cat, i) => {
            const name = localized(cat.name, locale);
            const description = cat.description ? localized(cat.description, locale) : '';
            const Icon = ICON_MAP[cat.slug] || Factory;
            const img = IMAGE_MAP[cat.slug];
            const count = counts[cat.slug] ?? 0;

            return (
              <RevealOnScroll key={cat.id} delay={i * 80} className="h-full">
                <Link
                  href={`/${locale}/category/${cat.slug}`}
                  className="group relative flex h-full min-w-[260px] snap-start flex-col overflow-hidden rounded-2xl pro-card p-0 transition hover:-translate-y-1 hover:shadow-xl sm:min-w-0"
                >
                  {/* Top accent bar — visual anchor */}
                  <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-brand-400 to-brand-700" aria-hidden="true" />

                  {/* Banner image with gradient overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {img && (
                      <ImageWithRetry
                        src={img}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                    <span className="absolute start-3 top-3">
                      <IconTile icon={Icon} className="h-5 w-5" tileClassName="bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md p-2.5" />
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-ink-900">{name}</h3>
                    {description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{description}</p>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-ink-500">
                      {count} {t('home.categories.productCount')}
                      <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            );
          })}

        </div>
      </div>
    </section>
  );
}
