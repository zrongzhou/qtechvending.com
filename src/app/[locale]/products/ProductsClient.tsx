'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import ProductCard from '@/components/products/ProductCard';
import FilterBar from '@/components/products/FilterBar';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
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
    <div className="container-qtech bg-gradient-to-b from-ocean-50/60 via-slate-50 to-white py-12 lg:py-16">
      <RevealOnScroll className="mb-8 md:mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {t('products.eyebrow')}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          {t('products.title')}
        </h1>
        {/* Subtle ocean gradient accent line under the heading */}
        <span className="mt-4 block h-1 w-20 rounded-full bg-gradient-to-r from-ocean-400 to-brand-600" aria-hidden="true" />
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
          {t('products.subtitle')}
        </p>
      </RevealOnScroll>

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

        <OceanGlassCard depth="sm" hoverLift={false} className="rounded-3xl p-4 sm:p-6">
          {data.length === 0 ? (
            <OceanGlassCard ripple depth="sm" className="border border-dashed border-ocean-300 bg-white/80 p-12 text-center text-ink-600">
              {t('products.noResults')}
            </OceanGlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((p, i) => (
                <RevealOnScroll key={p.id} delay={(i % 9) * 60} className="h-full">
                  <ProductCard product={p} />
                </RevealOnScroll>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ocean-300 hover:bg-ocean-50 hover:text-ocean-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
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
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ocean-300 hover:bg-ocean-50 hover:text-ocean-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                {t('products.next')}
              </button>
            </div>
          )}
        </OceanGlassCard>
      </div>
    </div>
  );
}
