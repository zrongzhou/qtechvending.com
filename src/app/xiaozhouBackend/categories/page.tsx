'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import CategoryForm from '@/components/admin/CategoryForm';
import { t } from '@/components/admin/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const remove = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) load(page, search);
  };

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    load(page, search);
  };

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
            placeholder={t('admin.search')}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-500">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colName')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colIcon')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colType')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colStatus')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colOrder')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-ink-800">
                    {localized(c.name, 'en')}
                    <div className="text-xs text-ink-400">{c.slug}</div>
                  </td>
                  <td className="px-3 py-2">{c.icon || '—'}</td>
                  <td className="px-3 py-2 text-ink-600">{c.type}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-600">{c.order}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditing(c); setShowForm(true); }} className="text-brand-700 hover:underline">
                        {t('admin.edit')}
                      </button>
                      <button type="button" onClick={() => remove(c.id)} className="text-red-600 hover:underline">
                        {t('admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !items.length && (
            <p className="px-4 py-10 text-center text-ink-400">{t('admin.noData')}</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
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
