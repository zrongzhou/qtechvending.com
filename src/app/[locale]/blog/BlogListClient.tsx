'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost, Paginated } from '@/types';

export default function BlogListClient({ initial }: { initial: Paginated<BlogPost> }) {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<BlogPost>>(initial);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (opts: { search: string; page: number }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (opts.search.trim()) params.set('q', opts.search.trim());
      params.set('page', String(opts.page));
      const res = await fetch(`/api/blogs?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as Paginated<BlogPost>;
        setResult(json);
      }
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load({ search, page: 1 });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load({ search, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const { data, totalPages } = result;

  return (
    <div className="container-qtech bg-gradient-to-br from-slate-50 via-white to-brand-50/40 py-12 lg:py-16">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">{t('blog.title')}</h1>
          <p className="mt-2 text-ink-500">{t('blog.subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </header>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-ink-500">
          {t('blog.noPosts')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((post) => (
            <BlogCard key={post.id} post={post} />
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
  );
}
