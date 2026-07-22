'use client';

import { useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import FaqManager from '@/components/admin/FaqManager';
import { t } from '@/components/admin/i18n';

export default function FaqAdminPage() {
  const [stats, setStats] = useState<{ categories: number; items: number }>({ categories: 0, items: 0 });

  const statCards = [
    { label: t('admin.faqCategories'), value: stats.categories },
    { label: t('admin.faqItems'), value: stats.items },
  ];

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink-900">{t('admin.faq')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('admin.faqHint')}</p>

        {/* Overview stat cards. */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statCards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-sm text-ink-500">{c.label}</p>
              <p className="mt-2 text-3xl font-bold text-ink-900">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <FaqManager onStats={setStats} />
        </div>
      </main>
    </div>
  );
}
