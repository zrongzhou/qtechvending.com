'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import zh from '@/messages/zh.json';

const t = (k: string) => (zh as Record<string, string>)[k] || k;

interface Stats {
  total: number;
  unread: number;
  read: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0 });
  const [recent, setRecent] = useState<{ id: number; name: string; subject: string; isRead: boolean; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/contact-messages?limit=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/contact-messages?isRead=unread&limit=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/contact-messages?isRead=read&limit=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/contact-messages?limit=5', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([a, b, c, d]) => {
        setStats({ total: a.total || 0, unread: b.total || 0, read: c.total || 0 });
        setRecent(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: t('admin.total'), value: stats.total },
    { label: t('admin.unread'), value: stats.unread },
    { label: t('admin.read'), value: stats.read },
  ];

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink-900">
          {t('admin.welcome')}, Admin
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-sm text-ink-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">
                {loading ? '—' : c.value}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/xiaozhouBackend/contact-messages"
          className="mt-8 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {t('admin.contactMessages')} →
        </Link>

        {/* V49.8: recent messages preview so the dashboard is actually useful. */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">{t('admin.recentMessages')}</h2>
            <Link href="/xiaozhouBackend/contact-messages" className="text-sm font-medium text-brand-600 hover:underline">
              {t('admin.contactMessages')} →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">{t('admin.noMessages')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {recent.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{m.name}</p>
                    <p className="truncate text-xs text-ink-500">{m.subject}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.isRead ? 'bg-slate-100 text-ink-500' : 'bg-brand-100 text-brand-700'}`}>
                      {m.isRead ? t('admin.read') : t('admin.unread')}
                    </span>
                    <span className="text-xs text-ink-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
