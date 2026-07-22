'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import BulkActionsBar from '@/components/admin/BulkActionsBar';
import { t } from '@/components/admin/i18n';
import { localized } from '@/lib/localize';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '20');
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/products?${params.toString()}`, { credentials: 'include' });
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

  const bulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (!selected.size) return;
    if (action === 'delete' && !confirm(t('admin.deleteConfirm'))) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), action }),
      });
      if (res.ok) {
        setSelected(new Set());
        load(page, search);
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) load(page, search);
  };

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.products')}</h1>
          <Link
            href="/xiaozhouBackend/products/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('admin.newProduct')}
          </Link>
        </div>

        <div className="mt-4">
          <BulkActionsBar
            selected={Array.from(selected)}
            onClear={() => setSelected(new Set())}
            onAction={bulkAction}
            loading={bulkLoading}
          />
        </div>

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
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colSku')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colName')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colStatus')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colFeatured')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colOrder')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink-600">{p.sku}</td>
                  <td className="px-3 py-2 font-medium text-ink-800">
                    {localized(p.name, 'en')}
                    <div className="text-xs text-ink-400">{p.slug}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{p.featured ? '★' : '—'}</td>
                  <td className="px-3 py-2 text-ink-600">{p.order}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link href={`/xiaozhouBackend/products/${p.id}`} className="text-brand-700 hover:underline">
                        {t('admin.edit')}
                      </Link>
                      <button type="button" onClick={() => remove(p.id)} className="text-red-600 hover:underline">
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
