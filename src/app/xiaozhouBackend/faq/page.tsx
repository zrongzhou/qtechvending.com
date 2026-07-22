'use client';

import AdminNav from '@/components/admin/AdminNav';
import FaqManager from '@/components/admin/FaqManager';
import { t } from '@/components/admin/i18n';

export default function FaqAdminPage() {
  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink-900">{t('admin.faq')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('admin.faqHint')}</p>
        <div className="mt-4">
          <FaqManager />
        </div>
      </main>
    </div>
  );
}
