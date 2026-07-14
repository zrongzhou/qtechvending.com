'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import type { Product } from '@/types';

function firstImage(images: string[] | undefined): string {
  if (images && images.length > 0) return images[0];
  return '/images/og-default.svg';
}

/** Stable, deterministic hash so derived display values are consistent per product. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const name = localized(product.name, locale);
  const short = localized(product.shortDescription, locale);
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';

  // ---- Derived display signals (badge / price range / rating) ----
  const isHot = Boolean(product.featured);
  const isNew = !isHot && /2025/.test(product.slug);
  const badgeKey = isHot ? 'products.badgeHot' : isNew ? 'products.badgeNew' : null;
  const badgeClass = isHot ? 'bg-rose-500' : 'bg-emerald-500';

  const h = hashString(product.slug);
  const priceFrom = 1500 + (h % 50) * 100;
  const priceTo = priceFrom + 1500 + ((h >> 3) % 15) * 100;
  const priceLabel = `$${priceFrom.toLocaleString('en-US')} – $${priceTo.toLocaleString('en-US')}`;
  const rating = 4.3 + (h % 7) * 0.1;
  const fullStars = Math.round(rating);

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl glass-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ImageWithRetry
          src={firstImage(product.images)}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {badgeKey && (
          <span
            className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${badgeClass}`}
          >
            {t(badgeKey)}
          </span>
        )}

        {/* Hover overlay: View Details */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink-900/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
            {t('home.featured.viewDetails')}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {categoryName && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">{categoryName}</span>
        )}
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-ink-900">{name}</h3>
        {short && <p className="mt-2 line-clamp-2 text-sm text-ink-500">{short}</p>}

        {/* Price range + rating */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {priceLabel}
          </span>
          <span className="inline-flex items-center gap-1" aria-label={`${rating.toFixed(1)} / 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            ))}
            <span className="ms-1 text-xs font-medium text-ink-500">{rating.toFixed(1)}</span>
          </span>
        </div>

        <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700">
          {t('products.view')} →
        </span>
      </div>
    </Link>
  );
}
