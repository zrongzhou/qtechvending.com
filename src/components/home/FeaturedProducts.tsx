'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import ProductCard from '@/components/products/ProductCard';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import type { Product } from '@/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const { t, locale } = useLocale();
  if (!products.length) return null;

  return (
    <section className="bg-brand-50 py-20 md:py-28">
      <div className="container-qtech">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t('home.featured.eyebrow')}</p>
            <h2 className="mt-3 text-2xl font-bold text-ink-900 md:text-3xl">{t('home.featured.title')}</h2>
            <span className="mt-3 block h-1 w-16 rounded-full bg-brand-500" aria-hidden="true" />
            <p className="mt-4 text-ink-600">{t('home.featured.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/products`}
            className="shrink-0 btn-primary px-5 py-2.5 text-sm"
          >
            {t('home.featured.viewAll')} →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <RevealOnScroll key={p.id} delay={i * 80} className="h-full">
              <ProductCard product={p} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
