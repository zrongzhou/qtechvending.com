'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Product } from '@/types';

function firstImage(images: string[] | undefined): string {
  if (images && images.length > 0) return images[0];
  return '/images/og-default.svg';
}

export default function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const name = localized(product.name, locale);
  const short = localized(product.shortDescription, locale);
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:border-brand-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstImage(product.images)}
          alt={name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute start-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {categoryName}
          </span>
        )}
        <h3 className="mt-1 text-base font-semibold text-ink-900">{name}</h3>
        {short && <p className="mt-2 line-clamp-2 text-sm text-ink-500">{short}</p>}
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700">
          {t('products.view')} →
        </span>
      </div>
    </Link>
  );
}
