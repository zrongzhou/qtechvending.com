'use client';

import { Search, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

export type SortKey = 'featured' | 'newest' | 'name';

interface FilterBarProps {
  categories: Category[];
  selected: string[];
  onToggleCategory: (slug: string) => void;
  search: string;
  onSearch: (value: string) => void;
  sort: SortKey;
  onSort: (value: SortKey) => void;
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
  sort,
  onSort,
  onClear,
  total,
  loading,
}: FilterBarProps) {
  const { t, locale } = useLocale();
  const hasFilters = selected.length > 0 || search.trim().length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 ps-10 pe-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {/* Categories */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            {t('products.filterTitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selected.includes(cat.slug);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 text-ink-600 hover:border-brand-300'
                  }`}
                >
                  <span>{cat.icon || '🏷️'}</span>
                  {localized(cat.name, locale)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort + clear */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-ink-600">
            {t('products.sort')}:
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as SortKey)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="featured">{t('products.sortFeatured')}</option>
              <option value="newest">{t('products.sortNewest')}</option>
              <option value="name">{t('products.sortNameAsc')}</option>
            </select>
          </label>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-400">
              {loading ? t('products.loading') : `${total} ${t('products.results')}`}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50"
              >
                <X className="h-3.5 w-3.5" />
                {t('products.clear')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
