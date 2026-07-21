'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import { accentForCategory, iconForCategory } from '@/lib/accents';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
import IconTile from '@/components/ui/IconTile';
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
  // Distinct, coloured category icon (V44: icons themselves should differ).
  const CategoryIcon = iconForCategory(product.categories?.[0]?.slug);

  // ---- Derived display signals (badge) ----
  const isHot = Boolean(product.featured);
  const isNew = !isHot && /2025/.test(product.slug);
  const badgeKey = isHot ? 'products.badgeHot' : isNew ? 'products.badgeNew' : null;
  // The "Hot" tag is unified to the rose family on every card (no mixed
  // colours); the "NEW" tag keeps the per-category accent for variety.
  const HOT_BADGE = 'from-rose-500 to-pink-500';
  const badgeClass = oceanMode
    ? `bg-gradient-to-r ${isHot ? HOT_BADGE : accent.badge} text-white ${isHot ? 'shadow-[0_0_18px_rgba(244,63,94,0.5)]' : 'shadow-[0_0_18px_rgba(34,211,238,0.55)]'}`
    : `bg-gradient-to-r ${isHot ? HOT_BADGE : accent.badge} text-white`;

  // Bottom info line: model number (preferred) or category tag as a fallback.
  const modelSpec = product.specs?.find((s) => {
    const p = typeof s.param === 'string' ? s.param : localized(s.param, 'en');
    return p.trim().toLowerCase() === 'model';
  });
  const modelLabel =
    modelSpec != null
      ? (typeof modelSpec.value === 'string' ? modelSpec.value : localized(modelSpec.value, 'en'))?.trim() || ''
      : '';

  // Light-glass (products page / related cards on the light detail page) vs a
  // clean white card (home). The `ocean` flag now renders the universal
  // .glass-surface (set via OceanGlassCard surface="glass") — translucent white
  // with a crisp highlight and a cyan brand glow on hover — so both the
  // products page and the detail page share the same bright glass language.
  //
  // V46: the card edge is now tinted with the category colour. `.glass-surface`
  // (and `.ocean-glass`) bake in a generic white border and a `:hover` cyan
  // border/glow, so the category colours are emitted as `!important` Tailwind
  // utilities to win the cascade. `accent.border` / `accent.borderTop` carry
  // the `!` prefix already; the 2px top edge width also needs `!border-t-2`.
  const surfaceBase = oceanMode
    ? `p-0 border !border-t-2 ${accent.border} ${accent.borderTop} transition-all duration-300 ${accent.glowShadow}`
    : `border !border-t-2 ${accent.border} ${accent.borderTop} transition-all duration-300 hover:-translate-y-2 ${accent.glowShadow}`;
  const titleClass = 'text-ink-900';
  const shortClass = 'text-ink-600';
  const catPillClass = accent.pill;
  const chipClass = 'bg-slate-100 text-ink-600';
  const ctaClass = 'text-ocean-700';

  return (
    <OceanGlassCard
      ripple
      ripplePointer
      rippleRings={oceanMode ? 3 : 1}
      depth="md"
      surface={oceanMode ? 'glass' : 'ocean'}
      hoverLift={!oceanMode}
      rippleColor={oceanMode ? accent.ripple : 'rgba(8, 145, 178, 0.2)'}
      className={`group h-full product-card-glass ${surfaceBase}`}
    >
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="group/link relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        {/* Persistent ocean top accent bar — card memory point */}
        <span className={`absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r ${accent.topBar}`} />

        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ImageWithRetry
            src={firstImage(product.images)}
            alt={name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Coloured, category-distinct icon chip floating over the photo. */}
          <span className="absolute end-3 top-3 z-10 inline-flex items-center justify-center rounded-xl p-1 shadow-md ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110">
            <IconTile
              icon={CategoryIcon}
              className="h-4 w-4"
              tileClassName={`bg-gradient-to-br ${accent.topBar} text-white`}
            />
          </span>

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
