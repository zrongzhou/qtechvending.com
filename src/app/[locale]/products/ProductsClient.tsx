'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import ProductCard from '@/components/products/ProductCard';
import FilterBar from '@/components/products/FilterBar';
import type { Category, Paginated, Product } from '@/types';

interface ProductsClientProps {
  categories: Category[];
  initial: Paginated<Product>;
}

export default function ProductsClient({ categories, initial }: ProductsClientProps) {
  const { t, locale } = useLocale();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Product>>(initial);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (opts: { categories: string[]; search: string; page: number }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts.categories.length) params.set('category', opts.categories.join(','));
        if (opts.search.trim()) params.set('q', opts.search.trim());
        params.set('page', String(opts.page));
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as Paginated<Product>;
          setResult(json);
        }
      } catch {
        // network error — keep previous result
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reload when filters change (search is debounced).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load({ categories: selected, search, page: 1 });
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, search]);

  useEffect(() => {
    // page changes (pagination) reload with current filters
    load({ categories: selected, search, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggleCategory = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clear = () => {
    setSelected([]);
    setSearch('');
    setPage(1);
  };

  const { data, totalPages } = result;

  return (
    <div className="container-qtech bg-white py-12 lg:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('products.title')}</h1>
        <p className="mt-2 text-ink-500">{t('products.subtitle')}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FilterBar
            categories={categories}
            selected={selected}
            onToggleCategory={toggleCategory}
            search={search}
            onSearch={setSearch}
            onClear={clear}
            total={result.total}
            loading={loading}
          />
        </aside>

        <div>
          {data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-ink-500">
              {t('products.noResults')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                {t('products.prev')}
              </button>
              <span className="text-sm text-ink-500">
                {t('products.page')} {page} {t('products.of')} {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                {t('products.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
