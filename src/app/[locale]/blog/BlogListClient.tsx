'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import BlogCard from '@/components/blog/BlogCard';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
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
    <div className="container-qtech relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-cyan-50/30 py-12 lg:py-16">
      {/* V49.8: decorative colour blooms so the page reads less flat. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-20 start-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute top-1/3 end-0 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute bottom-0 start-1/4 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
      </div>
      <RevealOnScroll>
        <header className="mb-10 flex flex-col gap-5 border-b border-slate-100 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {locale === 'zh' ? '行业洞察' : locale === 'ar' ? 'رؤى الصناعة' : 'Industry Insights'}
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{t('blog.title')}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600">{t('blog.subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
          />
        </div>
        </header>
        <div className="mt-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
      </RevealOnScroll>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-ink-500">
          {t('blog.noPosts')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((post, i) => (
            <RevealOnScroll key={post.id} delay={(i % 9) * 60} className="h-full">
              <BlogCard post={post} index={i} />
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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
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
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            {t('products.next')}
          </button>
        </div>
      )}
    </div>
  );
}
