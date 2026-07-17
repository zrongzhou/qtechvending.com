'use client';

import { Search, X, ChevronDown, Factory, Flower2, Pizza, Candy, Egg, CupSoda, Snowflake, Coffee, IceCream, PawPrint, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

const CAT_ICON: Record<string, LucideIcon> = {
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

interface FilterBarProps {
  categories: Category[];
  selected: string[];
  onToggleCategory: (slug: string) => void;
  search: string;
  onSearch: (value: string) => void;
  onClear: () => void;
  total: number;
  loading: boolean;
}

export default function FilterBar({
  categories,
  selected,
  onToggleCategory,
  search,
  onSearch,
  onClear,
  total,
  loading,
}: FilterBarProps) {
  const { t, locale } = useLocale();
  const hasFilters = selected.length > 0 || search.trim().length > 0;

  return (
    <div className="pro-card relative overflow-hidden p-5">
      {/* Brand top accent bar — aligns with the card design system */}
      <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-brand-400 to-brand-700" aria-hidden="true" />
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 ps-10 pe-4 text-sm outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
          />
        </div>

        {/* Category dropdown */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-500">
            {t('products.filterTitle')}
          </label>
          <div className="relative">
            <select
              value={selected[0] ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                // single-select dropdown: replace selection with chosen slug
                if (v && !selected.includes(v)) onToggleCategory(v);
                else if (!v && selected.length) selected.forEach((s) => onToggleCategory(s));
              }}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pe-10 ps-3 text-sm font-medium text-ink-700 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
            >
              <option value="">{locale === 'zh' ? '全部品类' : locale === 'ar' ? 'كل الفئات' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {localized(cat.name, locale)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          </div>

          {/* Active filter chip */}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-medium text-ocean-700"
                  >
                    {cat ? localized(cat.name, locale) : slug}
                    <button
                      type="button"
                      onClick={() => onToggleCategory(slug)}
                      className="rounded-full p-0.5 hover:bg-ocean-100"
                      aria-label="remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-ink-500">
            {loading ? t('products.loading') : `${total} ${t('products.results')}`}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-brand-700 transition hover:bg-ocean-50"
            >
              <X className="h-3.5 w-3.5" />
              {t('products.clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
