'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const { t, locale } = useLocale();
  if (!products.length) return null;

  return (
    <section className="container-qtech py-16 lg:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink-900">{t('home.featured.title')}</h2>
          <p className="mt-2 text-ink-500">{t('home.featured.subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/products`}
          className="hidden shrink-0 rounded-full border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 sm:inline-flex"
        >
          {t('home.featured.viewAll')} →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
