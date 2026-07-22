'use client';

import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';
import { t } from '@/components/admin/i18n';

export default function ProductNewPage() {
  const router = useRouter();
  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.newProduct')}</h1>
          <button
            type="button"
            onClick={() => router.push('/xiaozhouBackend/products')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-slate-50"
          >
            {t('admin.backToList')}
          </button>
        </div>
        <ProductForm initial={null} onSaved={() => router.push('/xiaozhouBackend/products')} />
      </main>
    </div>
  );
}
