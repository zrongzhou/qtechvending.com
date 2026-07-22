'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import CategoryForm from '@/components/admin/CategoryForm';
import { t } from '@/components/admin/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
}

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<CategoryStats>({ total: 0, active: 0, inactive: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '20');
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/categories?${params.toString()}`, { credentials: 'include' });
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

  /** Fetch overall category counts so the overview cards stay accurate. */
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const base = new URLSearchParams();
      base.set('limit', '1');
      const [all, active, inactive] = await Promise.all([
        fetch(`/api/admin/categories?${base.toString()}`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`/api/admin/categories?${base.toString()}&status=active`, { credentials: 'include' }).then((r) => r.json()),
        fetch(`/api/admin/categories?${base.toString()}&status=inactive`, { credentials: 'include' }).then((r) => r.json()),
      ]);
      setStats({
        total: all.total || 0,
        active: active.total || 0,
        inactive: inactive.total || 0,
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

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      load(page, search);
      loadStats();
    }
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load(page, search);
    loadStats();
  };

  const statCards = [
    { label: t('admin.totalCategories'), value: stats.total },
    { label: t('admin.activeProducts'), value: stats.active },
    { label: t('admin.inactiveProducts'), value: stats.inactive },
  ];

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.categories')}</h1>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('admin.newCategory')}
          </button>
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

        {showForm && (
          <div className="mt-4">
            <CategoryForm
              initial={editing}
              onSaved={onSaved}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <div className="mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchCategoriesPlaceholder')}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
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
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">{t('admin.noData')}</h3>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('admin.newCategory')}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg">
                    {c.icon || '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-ink-900" title={localized(c.name, 'zh')}>
                      {localized(c.name, 'zh')}
                    </h3>
                    <p className="truncate font-mono text-xs text-ink-400" title={c.slug}>
                      {c.slug}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 px-4">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-500">{c.type}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="mt-2 px-4 text-xs text-ink-400">Order: {c.order}</p>

                <div className="mt-auto flex gap-2 p-4 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(c);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-brand-700"
                  >
                    {t('admin.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
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
