'use client';

import Link from 'next/link';
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

  // ---- Derived display signals (badge / price range) ----
  const isHot = Boolean(product.featured);
  const isNew = !isHot && /2025/.test(product.slug);
  const badgeKey = isHot ? 'products.badgeHot' : isNew ? 'products.badgeNew' : null;
  const badgeClass = isHot ? 'bg-rose-500' : 'bg-emerald-500';

  const h = hashString(product.slug);
  const priceFrom = 1500 + (h % 50) * 100;
  const priceTo = priceFrom + 1500 + ((h >> 3) % 15) * 100;
  const priceLabel = `$${priceFrom.toLocaleString('en-US')} – $${priceTo.toLocaleString('en-US')}`;

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl pro-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Top accent line on hover */}
      <span className="absolute inset-x-0 top-0 z-20 h-0.5 scale-x-0 bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-500 group-hover:scale-x-100" />

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ImageWithRetry
          src={firstImage(product.images)}
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Gradient scrim for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge — compact, small radius */}
        {badgeKey && (
          <span
            className={`absolute start-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm ${badgeClass}`}
          >
            {badgeKey === 'products.badgeHot' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
            {t(badgeKey)}
          </span>
        )}

        {/* Hover overlay: View Details */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink-900/85 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
            {t('home.featured.viewDetails')}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Category pill */}
        {categoryName && (
          <span className="inline-flex w-fit items-center rounded-md bg-gradient-to-r from-brand-50 to-brand-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
            {categoryName}
          </span>
        )}

        {/* Title — single line, bold */}
        <h3 className="mt-2 line-clamp-1 text-lg font-bold tracking-tight text-ink-900 transition-colors group-hover:text-brand-700">
          {name}
        </h3>

        {/* Description — muted, de-emphasised */}
        {short && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-400">{short}</p>}

        {/* Price (solid sunset gradient pill) */}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-1.5 text-sm font-bold text-white shadow-sm">
            {priceLabel}
          </span>
        </div>

        {/* Bottom action bar — clean slide-in */}
        <div className="mt-3 flex items-center justify-between transition-transform duration-300 group-hover:translate-x-1">
          <span className="text-sm font-semibold text-brand-600">{t('products.view')}</span>
          <span aria-hidden="true" className="text-brand-600 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}
