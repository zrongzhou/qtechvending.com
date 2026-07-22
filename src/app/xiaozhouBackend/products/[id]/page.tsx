'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import ProductForm from '@/components/admin/ProductForm';
import { t } from '@/components/admin/i18n';
import type { Product } from '@/types';

export default function ProductEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setProduct(j.data || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.editProduct')}</h1>
          <button
            type="button"
            onClick={() => router.push('/xiaozhouBackend/products')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-slate-50"
          >
            {t('admin.backToList')}
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-ink-400">{t('common.loading')}</p>
        ) : !product ? (
          <p className="text-sm text-ink-400">{t('admin.notFound')}</p>
        ) : (
          <ProductForm
            initial={product}
            onSaved={() => router.push('/xiaozhouBackend/products')}
          />
        )}
      </main>
    </div>
  );
}
