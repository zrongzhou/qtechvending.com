'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { accentForCategory } from '@/lib/accents';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import type { Product } from '@/types';

function firstImage(images: string[] | undefined): string {
  if (images && images.length > 0) return images[0];
  return '/images/og-default.svg';
}

/**
 * Product card.
 *  - `ocean` mode (product list / product pages): translucent glass surface,
 *    white text, a pointer-driven multi-ring water ripple on hover, an
 *    "underwater" bottom-fade mask on the photo, cyan-glow accents and glowing
 *    ocean→teal badges.
 *  - Light mode (home / related): clean white card with brand-tinted accents.
 */
export default function ProductCard({
  product,
  ocean = false,
  dark = false,
}: {
  product: Product;
  ocean?: boolean;
  dark?: boolean;
}) {
  const { locale, t } = useLocale();
  // `dark` kept for backwards compatibility; ocean is the canonical flag.
  const oceanMode = ocean || dark;

  const name = localized(product.name, locale);
  const short = localized(product.shortDescription, locale);
  const category = product.categories?.[0];
  const categoryName = category ? localized(category.name, locale) : '';
  // Per-category accent (F6): same category shares a color, different categories differ.
  const accent = accentForCategory(product.categories?.[0]?.slug);

  // ---- Derived display signals (badge) ----
  const isHot = Boolean(product.featured);
  const isNew = !isHot && /2025/.test(product.slug);
  const badgeKey = isHot ? 'products.badgeHot' : isNew ? 'products.badgeNew' : null;
  // Ocean-tinted badge (cyan → teal) for an on-theme "HOT"/"NEW" tag, with a
  // soft cyan glow ring in ocean mode.
  const badgeClass = oceanMode
    ? `bg-gradient-to-r ${accent.badge} text-white shadow-[0_0_18px_rgba(34,211,238,0.55)]`
    : `bg-gradient-to-r ${accent.badge} text-white`;

  // Bottom info line: model number (preferred) or category tag as a fallback.
  const modelSpec = product.specs?.find((s) => s.param.trim().toLowerCase() === 'model');
  const modelLabel = modelSpec?.value?.trim() || '';

  // Dark (products-page ocean theme) vs light (home / detail) presentation.
  const surfaceBase = oceanMode
    ? 'bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.14] hover:shadow-[0_24px_60px_rgba(56,189,248,0.25)]'
    : 'border border-ocean-200/60 transition-all duration-300 hover:-translate-y-2 hover:border-ocean-300/60 hover:shadow-ocean-lg';
  const titleClass = oceanMode ? 'text-white' : 'text-ink-900';
  // V38: lift description opacity for better hover readability in ocean mode.
  const shortClass = oceanMode ? 'text-white/95' : 'text-ink-500';
  const catPillClass = oceanMode ? 'from-white/15 to-white/10 text-white/80' : accent.pill;
  const chipClass = oceanMode ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-ink-600';
  const ctaClass = oceanMode ? 'text-cyan-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]' : 'text-ocean-700';

  return (
    <OceanGlassCard
      ripple
      ripplePointer
      rippleRings={oceanMode ? 3 : 1}
      depth="md"
      hoverLift={!oceanMode}
      rippleColor={oceanMode ? accent.ripple : 'rgba(8, 145, 178, 0.2)'}
      className={`group h-full ${surfaceBase}`}
    >
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="group/link relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        {/* Persistent ocean top accent bar — card memory point */}
        <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${accent.topBar}`} />

        <div
          className="relative aspect-[4/3] overflow-hidden bg-slate-100"
          style={
            oceanMode
              ? {
                  WebkitMaskImage: 'linear-gradient(to bottom, #000 78%, transparent)',
                  maskImage: 'linear-gradient(to bottom, #000 78%, transparent)',
                }
              : undefined
          }
        >
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
              className={`absolute start-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-white ${badgeClass}`}
            >
              {badgeKey === 'products.badgeHot' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
              {t(badgeKey)}
            </span>
          )}

          {/* Hover overlay: View Details — ocean gradient button */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ocean-800/75 via-ocean-700/30 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
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

          {/* Title — single line, bold, always fully opaque on hover. */}
          <h3 className={`mt-2 line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-white ${titleClass}`}>
            {name}
          </h3>

          {/* Description — muted but readable. */}
          {short && <p className={`mt-2 line-clamp-2 text-xs leading-relaxed ${shortClass}`}>{short}</p>}

          {/* Bottom info — model number (preferred) or category tag */}
          <div className="mt-auto pt-4">
            {modelLabel ? (
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${chipClass}`}>
                <span className={oceanMode ? 'text-white/50' : 'text-ink-500'}>{t('product.model')}</span>
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
