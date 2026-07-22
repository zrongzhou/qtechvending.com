'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import zh from '@/messages/zh.json';

const t = (k: string) => (zh as Record<string, string>)[k] || k;

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  productInterest: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  locale: string;
  createdAt: string;
}

type Filter = 'all' | 'unread' | 'read';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Message | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (p: number, f: Filter, q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('limit', '15');
        if (f !== 'all') params.set('isRead', f);
        if (q.trim()) params.set('search', q.trim());
        const res = await fetch(`/api/admin/contact-messages?${params.toString()}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setMessages(json.data || []);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        }
      } catch {
        // keep
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(1, filter, search);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  useEffect(() => {
    load(page, filter, search);
    // eslint-disable-next-line react-hooks/exhausting-deps
  }, [page]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkAction = async (action: 'read' | 'delete') => {
    if (!selected.size) return;
    if (action === 'delete' && !confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch('/api/admin/contact-messages', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), action }),
    });
    if (res.ok) {
      setSelected(new Set());
      load(page, filter, search);
    }
  };

  // V49.8: mark every unread message as read in one action.
  const markAllRead = async () => {
    const res = await fetch('/api/admin/contact-messages', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'readAll' }),
    });
    if (res.ok) load(page, filter, search);
  };

  const singleDelete = async (id: number) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/contact-messages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      if (detail?.id === id) setDetail(null);
      load(page, filter, search);
    }
  };

  const openDetail = async (m: Message) => {
    setDetail(m);
    if (!m.isRead) {
      const res = await fetch(`/api/admin/contact-messages/${m.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)));
      }
    }
  };

  const filters: Filter[] = ['all', 'unread', 'read'];

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.contactMessages')}</h1>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.search')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Filter tabs + bulk actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  filter === f ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 border border-slate-300'
                }`}
              >
                {t(`admin.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-md border border-cyan-300 px-3 py-1.5 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50"
            >
              {t('admin.markAllRead')}
            </button>
            <button
              type="button"
              disabled={!selected.size}
              onClick={() => bulkAction('read')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink-600 disabled:opacity-40"
            >
              {t('admin.markRead')}
            </button>
            <button
              type="button"
              disabled={!selected.size}
              onClick={() => bulkAction('delete')}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-40"
            >
              {t('admin.delete')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-500">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colName')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colEmail')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colSubject')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colMessage')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colDate')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colStatus')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className={`border-t border-slate-100 ${m.isRead ? '' : 'bg-brand-50/40'}`}>
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} />
                  </td>
                  <td className="px-3 py-2 font-medium text-ink-800">{m.name}</td>
                  <td className="px-3 py-2 text-ink-600">{m.email}</td>
                  <td className="px-3 py-2 text-ink-600">{m.subject}</td>
                  <td className="max-w-xs truncate px-3 py-2 text-ink-500">{m.message}</td>
                  <td className="px-3 py-2 text-ink-500">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.isRead ? 'bg-slate-100 text-ink-500' : 'bg-brand-100 text-brand-700'}`}>
                      {m.isRead ? t('admin.read') : t('admin.unread')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openDetail(m)} className="text-brand-700 hover:underline">
                        {t('admin.viewDetail')}
                      </button>
                      <button type="button" onClick={() => singleDelete(m.id)} className="text-red-600 hover:underline">
                        {t('admin.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && messages.length === 0 && (
            <p className="px-4 py-10 text-center text-ink-400">{t('admin.noMessages')}</p>
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

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setDetail(null)}>
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">{t('admin.detail')}</h2>
              <button type="button" onClick={() => setDetail(null)} className="text-ink-400 hover:text-ink-700">
                ✕
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-medium text-ink-500">{t('admin.colName')}</dt><dd>{detail.name}</dd></div>
              <div><dt className="font-medium text-ink-500">{t('admin.colEmail')}</dt><dd>{detail.email}</dd></div>
              {detail.phone && <div><dt className="font-medium text-ink-500">Phone</dt><dd>{detail.phone}</dd></div>}
              {detail.company && <div><dt className="font-medium text-ink-500">Company</dt><dd>{detail.company}</dd></div>}
              {detail.country && <div><dt className="font-medium text-ink-500">Country</dt><dd>{detail.country}</dd></div>}
              {detail.productInterest && <div><dt className="font-medium text-ink-500">Product</dt><dd>{detail.productInterest}</dd></div>}
              <div><dt className="font-medium text-ink-500">{t('admin.colSubject')}</dt><dd>{detail.subject}</dd></div>
              <div><dt className="font-medium text-ink-500">{t('admin.colDate')}</dt><dd>{new Date(detail.createdAt).toLocaleString()}</dd></div>
            </dl>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-ink-700">
              {detail.message}
            </div>
            <button
              type="button"
              onClick={() => singleDelete(detail.id)}
              className="mt-6 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600"
            >
              {t('admin.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
