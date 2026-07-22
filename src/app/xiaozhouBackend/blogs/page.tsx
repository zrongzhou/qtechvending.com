'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import BulkActionsBar from '@/components/admin/BulkActionsBar';
import { t } from '@/components/admin/i18n';
import { localized } from '@/lib/localize';
import type { BlogPost } from '@/types';

interface BlogStats {
  total: number;
  published: number;
  draft: number;
}

export default function BlogsPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [stats, setStats] = useState<BlogStats>({ total: 0, published: 0, draft: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '20');
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/blogs?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch {
      /* keep */
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch overall blog counts so the overview cards stay accurate. */
  const loadStats = useCallback(async (q: string) => {
    setStatsLoading(true);
    try {
      const base = new URLSearchParams();
      if (q.trim()) base.set('search', q.trim());
      base.set('limit', '1');
      const [all, published, draft] = await Promise.all([
        fetch(`/api/admin/blogs?${base.toString()}`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`/api/admin/blogs?${base.toString()}&status=published`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`/api/admin/blogs?${base.toString()}&status=draft`, { credentials: 'include' }).then((r) => r.json()),
      ]);
      setStats({
        total: all.total || 0,
        published: published.total || 0,
        draft: draft.total || 0,
      });
    } catch {
      /* keep */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(1, search);
      loadStats(search);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    load(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === items.length && items.length ? new Set() : new Set(items.map((i) => i.id))
    );

  const allOnPageSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  const bulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (!selected.size) return;
    if (action === 'delete' && !confirm(t('admin.deleteConfirm'))) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/blogs/bulk', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) {
        setSelected(new Set());
        load(page, search);
        loadStats(search);
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      load(page, search);
      loadStats(search);
    }
  };

  const statCards = [
    { label: t('admin.totalProducts'), value: stats.total },
    { label: t('admin.publishedBlogs'), value: stats.published },
    { label: t('admin.draftBlogs'), value: stats.draft },
  ];

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.blogs')}</h1>
          <Link
            href="/xiaozhouBackend/blogs/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('admin.newBlog')}
          </Link>
        </div>

        {/* Overview stat cards. */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-sm text-ink-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">{statsLoading ? '—' : c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <BulkActionsBar
            selected={Array.from(selected)}
            onClear={() => setSelected(new Set())}
            onAction={bulkAction}
            loading={bulkLoading}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchBlogsPlaceholder')}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          {items.length > 0 && (
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-slate-300"
              />
              {allOnPageSelected ? t('admin.clearSelection') : t('admin.selectedCount').replace('{n}', String(items.length))}
            </label>
          )}
        </div>

        {!loading && !items.length ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <svg
              className="h-14 w-14 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">{t('admin.noData')}</h3>
            <Link
              href="/xiaozhouBackend/blogs/new"
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('admin.newBlog')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => {
              const img = p.images?.[0] || undefined;
              return (
                <div
                  key={p.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={localized(p.title, 'zh')}
                    className="absolute left-3 top-3 z-10 h-4 w-4 cursor-pointer rounded border-slate-300 bg-white"
                  />
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={localized(p.title, 'zh')}
                      className="h-40 w-full rounded-t-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-t-2xl bg-gradient-to-br from-brand-100 to-slate-100">
                      <span className="px-3 text-center text-sm font-semibold text-brand-700">
                        {localized(p.title, 'zh')}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="truncate text-sm font-semibold text-ink-900" title={localized(p.title, 'zh')}>
                      {localized(p.title, 'zh')}
                    </h3>
                    <p className="truncate font-mono text-xs text-ink-400" title={p.slug}>
                      {p.slug}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-500'
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <span aria-hidden="true">★</span>
                          {t('admin.colFeatured')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink-400">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                    </p>

                    <div className="mt-auto flex gap-2 pt-3">
                      <Link
                        href={`/xiaozhouBackend/blogs/${p.id}`}
                        className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-brand-700"
                      >
                        {t('admin.edit')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        {t('admin.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <p className="mt-6 text-center text-sm text-ink-400">{t('common.loading')}</p>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
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
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              {t('products.next')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
