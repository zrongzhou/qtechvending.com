'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import type { Product } from '@/types';

function firstImage(images: string[] | undefined): string {
  if (images && images.length > 0) return images[0];
  return '/images/og-default.svg';
}

export default function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { locale, t } = useLocale();
  const name = localized(product.name, locale);
  const short = localized(product.shortDescription, locale);
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';

  // ---- Derived display signals (badge) ----
  const isHot = Boolean(product.featured);
  const isNew = !isHot && /2025/.test(product.slug);
  const badgeKey = isHot ? 'products.badgeHot' : isNew ? 'products.badgeNew' : null;
  // Ocean-tinted badge (cyan → teal) for an on-theme "HOT"/"NEW" tag.
  const badgeClass = 'bg-gradient-to-r from-cyan-400 to-teal-500 text-white';

  // Bottom info line: model number (preferred) or category tag as a fallback.
  const modelSpec = product.specs?.find((s) => s.param.trim().toLowerCase() === 'model');
  const modelLabel = modelSpec?.value?.trim() || '';

  // Dark (products-page ocean theme) vs light (home / detail) presentation.
  const surfaceBase = dark
    ? 'bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.18] hover:shadow-[0_24px_60px_rgba(56,189,248,0.25)]'
    : 'border border-ocean-200/60 transition-all duration-300 hover:-translate-y-2 hover:border-ocean-300/60 hover:shadow-ocean-lg';
  const titleClass = dark ? 'text-white' : 'text-ink-900';
  const shortClass = dark ? 'text-white/70' : 'text-ink-500';
  const catPillClass = dark ? 'from-white/15 to-white/10 text-white/80' : 'from-ocean-50 to-brand-100 text-ocean-700';
  const chipClass = dark ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-ink-600';
  const ctaClass = dark ? 'text-cyan-300' : 'text-ocean-700';

  return (
    <OceanGlassCard
      ripple
      depth="md"
      hoverLift={!dark}
      rippleColor={dark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(8, 145, 178, 0.2)'}
      className={`group h-full ${surfaceBase}`}
    >
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="group/link relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        {/* Persistent ocean top accent bar — card memory point */}
        <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" />

        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ImageWithRetry
            src={firstImage(product.images)}
            alt={name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Gradient scrim for legibility — ocean-toned */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badge — bold ocean→teal pill with glow */}
          {badgeKey && (
            <span
              className={`absolute start-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 ${badgeClass}`}
            >
              {badgeKey === 'products.badgeHot' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
              {t(badgeKey)}
            </span>
          )}

          {/* Hover overlay: View Details — ocean gradient button */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ocean-900/90 via-ocean-700/30 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-ocean-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
              {t('home.featured.viewDetails')}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {/* Category pill */}
          {categoryName && (
            <span className={`inline-flex w-fit items-center rounded-md bg-gradient-to-r px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${catPillClass}`}>
              {categoryName}
            </span>
          )}

          {/* Title — single line, bold */}
          <h3 className={`mt-2 line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-ocean-700 ${titleClass}`}>
            {name}
          </h3>

          {/* Description — muted, de-emphasised */}
          {short && <p className={`mt-2 line-clamp-2 text-xs leading-relaxed ${shortClass}`}>{short}</p>}

          {/* Bottom info — model number (preferred) or category tag */}
          <div className="mt-auto pt-4">
            {modelLabel ? (
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${chipClass}`}>
                <span className={dark ? 'text-white/50' : 'text-ink-500'}>{t('product.model')}</span>
                <span className="font-mono">{modelLabel}</span>
              </span>
            ) : (
              categoryName && (
                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold ${chipClass}`}>
                  {categoryName}
                </span>
              )
            )}
          </div>

          {/* Bottom action bar — clean slide-in */}
          <div className="mt-3 flex items-center justify-between transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            <span className={`text-sm font-semibold ${ctaClass}`}>{t('products.view')}</span>
            <span aria-hidden="true" className={`${ctaClass} transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1`}>→</span>
          </div>
        </div>
      </Link>
    </OceanGlassCard>
  );
}
