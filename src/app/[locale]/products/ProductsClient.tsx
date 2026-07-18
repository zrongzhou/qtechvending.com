'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import ProductCard from '@/components/products/ProductCard';
import FilterBar from '@/components/products/FilterBar';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import OceanBubbles from '@/components/ui/OceanBubbles';
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-500/40 via-teal-400/30 to-sky-300/25">
      {/* Deep ocean base layer behind the brighter overlay for depth (V39 lighter). */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-cyan-600/60 via-teal-500/50 to-sky-400/45" aria-hidden="true" />
      {/* Sunlight sheen from the surface (upper-ocean glow) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-sky-400/25 via-cyan-400/10 to-transparent" aria-hidden="true" />

      {/* God rays — drifting light beams piercing the water */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="god-ray god-ray--1" />
        <div className="god-ray god-ray--2" />
        <div className="god-ray god-ray--3" />
        <div className="god-ray god-ray--4" />
      </div>

      {/* Rising bubbles behind the content */}
      <OceanBubbles className="-z-10" />

      {/* Animated CSS ocean waves at the bottom of the hero area */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 overflow-hidden" aria-hidden="true">
        <div className="ocean-wave ocean-wave--1" />
        <div className="ocean-wave ocean-wave--2" />
        <div className="ocean-wave ocean-wave--3" />
      </div>

      <div className="container-qtech relative z-10 py-12 lg:py-16">
        <RevealOnScroll className="mb-8 md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200/90">
            {t('products.eyebrow')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">
            {t('products.title')}
          </h1>
          {/* Animated ocean wave divider under the heading */}
          <span
            className="wave-divider mt-4 block h-1 w-[200px] rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-300"
            aria-hidden="true"
          />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cyan-50/80">
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

          <OceanGlassCard depth="sm" hoverLift={false} className="rounded-3xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-6">
            {data.length === 0 ? (
              <OceanGlassCard ripple depth="sm" className="border border-dashed border-white/25 bg-white/5 p-12 text-center text-white/80">
                {t('products.noResults')}
              </OceanGlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.map((p, i) => (
                  <RevealOnScroll key={p.id} delay={(i % 9) * 100} className="h-full">
                    <ProductCard product={p} ocean />
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
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:bg-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-900"
                >
                  {t('products.prev')}
                </button>
                <span className="text-sm text-cyan-50/80">
                  {t('products.page')} {page} {t('products.of')} {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-cyan-300 hover:bg-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-900"
                >
                  {t('products.next')}
                </button>
              </div>
            )}
          </OceanGlassCard>
        </div>
      </div>
    </div>
  );
}
