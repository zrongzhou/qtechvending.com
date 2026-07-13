'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import en from '@/messages/en.json';

const t = (k: string) => (en as Record<string, string>)[k] || k;

interface Stats {
  total: number;
  unread: number;
  read: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/contact-messages?limit=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/contact-messages?isRead=unread&limit=1', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/contact-messages?isRead=read&limit=1', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([a, b, c]) => {
        setStats({ total: a.total || 0, unread: b.total || 0, read: c.total || 0 });
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
      </main>
    </div>
  );
}
