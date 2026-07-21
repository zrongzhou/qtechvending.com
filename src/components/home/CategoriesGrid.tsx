'use client';

import Link from 'next/link';
import {
  Flower2,
  Pizza,
  Candy,
  Egg,
  CupSoda,
  Snowflake,
  Coffee,
  IceCream,
  PawPrint,
  Sparkles,
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
  'pet-food-vending-machine': PawPrint,
  'beauty-products-vending-machine': Sparkles,
};

// Banner photo per category slug (generated visuals in public/images/categories).
const IMAGE_MAP: Record<string, string> = {
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
  // V49.19: these two homepage categories previously had no cover → blank cards.
  // Reuse representative product photos as their category banners.
  'pet-food-vending-machine': '/images/products/refrigerated-pet-food-vending-machine-for-fresh-meals-and-treats/image01.webp',
  'beauty-products-vending-machine': '/images/products/beauty-products-vending-machine-for-eyelashes-and-cosmetics/image01.webp',
};

// V44: per-category theme colours (the V41 "CASE_THEMES" approach) so the 8+
// category cards no longer share one cyan bar + one glossy icon. Each category
// gets a distinct top-bar gradient, icon-tile gradient and a soft coloured glow
// (--cat-glow) used on hover so the grid reads as a vibrant, differentiated set.
interface CatTheme {
  topBar: string;
  tile: string;
  glow: string;
}
const CATEGORY_THEMES: Record<string, CatTheme> = {
  'fresh-flower-vending-machine': { topBar: 'from-rose-400 to-pink-500', tile: 'from-rose-500 to-pink-500', glow: 'rgba(244,114,182,0.45)' },
  'pizza-vending-machine': { topBar: 'from-amber-400 to-orange-500', tile: 'from-amber-500 to-orange-500', glow: 'rgba(251,146,60,0.45)' },
  'cotton-candy-machine': { topBar: 'from-violet-400 to-fuchsia-500', tile: 'from-violet-500 to-fuchsia-500', glow: 'rgba(167,139,250,0.45)' },
  'fruit-vegetable-egg-vending-machine': { topBar: 'from-emerald-400 to-green-500', tile: 'from-emerald-500 to-green-500', glow: 'rgba(16,185,129,0.45)' },
  'sugar-cane-juice-vending-machine': { topBar: 'from-lime-400 to-emerald-500', tile: 'from-lime-500 to-emerald-500', glow: 'rgba(132,204,22,0.45)' },
  'ice-maker-vending-machine': { topBar: 'from-sky-400 to-blue-500', tile: 'from-sky-500 to-blue-500', glow: 'rgba(56,189,248,0.45)' },
  'coffee-vending-machine': { topBar: 'from-amber-700 to-yellow-800', tile: 'from-amber-600 to-yellow-800', glow: 'rgba(217,119,6,0.45)' },
  'ice-cream-vending-machine': { topBar: 'from-cyan-400 to-blue-500', tile: 'from-cyan-500 to-blue-500', glow: 'rgba(34,211,238,0.45)' },
  'pet-washing-machine': { topBar: 'from-pink-500 to-rose-500', tile: 'from-pink-500 to-rose-500', glow: 'rgba(244,114,182,0.45)' },
  'food-vending-machine': { topBar: 'from-orange-400 to-red-500', tile: 'from-orange-500 to-red-500', glow: 'rgba(239,68,68,0.45)' },
  'pet-food-vending-machine': { topBar: 'from-pink-400 to-rose-500', tile: 'from-pink-500 to-rose-500', glow: 'rgba(244,114,182,0.45)' },
  'beauty-products-vending-machine': { topBar: 'from-violet-400 to-fuchsia-500', tile: 'from-violet-500 to-fuchsia-500', glow: 'rgba(167,139,250,0.45)' },
};
const DEFAULT_THEME: CatTheme = { topBar: 'from-cyan-400 to-teal-500', tile: 'from-cyan-500 to-teal-500', glow: 'rgba(20,184,166,0.45)' };
const themeFor = (slug: string): CatTheme => CATEGORY_THEMES[slug] ?? DEFAULT_THEME;

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
            const Icon = ICON_MAP[cat.slug] || Flower2;
            const img = IMAGE_MAP[cat.slug];
            const count = counts[cat.slug] ?? 0;
            const theme = themeFor(cat.slug);

            return (
              <RevealOnScroll key={cat.id} delay={i * 80} className="h-full">
                <Link
                  href={`/${locale}/category/${cat.slug}`}
                  className="group relative flex h-full min-w-[260px] snap-start flex-col overflow-hidden rounded-2xl pro-card p-0 transition hover:-translate-y-1 hover:shadow-ocean sm:min-w-0"
                  style={{ ['--cat-glow' as string]: theme.glow }}
                >
                  {/* Top accent bar — per-category colour */}
                  <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${theme.topBar}`} aria-hidden="true" />

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
                    <span className="absolute start-3 top-3 rounded-2xl p-1 shadow-lg ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110">
                      <IconTile
                        icon={Icon}
                        className="h-5 w-5"
                        tileClassName={`bg-gradient-to-br ${theme.tile} text-white`}
                      />
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
                      {name}
                    </h3>
                    {description && <p className="mt-1 line-clamp-2 text-sm text-ink-500">{description}</p>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-ink-500">
                      {count} {t('home.categories.productCount')}
                      <span aria-hidden="true" className="transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
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
