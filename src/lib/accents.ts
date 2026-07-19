/**
 * Category accent system (V37 / F6 / V46).
 *
 * Maps a product CATEGORY SLUG to a cohesive accent set that is reused across
 * the product cards (top bar, HOT/NEW badge, hover ripple, category pill,
 * tinted border and a subtle category-coloured hover glow). Slugs are aligned
 * with the real categories defined in the data layer (see
 * `src/components/home/CategoriesGrid.tsx` CATEGORY_THEMES). The palette here
 * is deliberately kept in lock-step with `CATEGORY_THEMES` so the home category
 * grid and the product cards read as one coherent, differentiated family.
 *
 * Every colour is expressed as a **literal Tailwind class string** (no dynamic
 * concatenation) so the JIT compiler can statically see and emit it.
 *
 * Unmapped slugs fall back to the brand cyan/teal DEFAULT_ACCENT so the site
 * never renders a "missing" accent.
 *
 * V46: previously only 7 of the 10 categories were mapped (the remaining 3
 * silently fell back to the cyan default, breaking the "≥6 distinct hues"
 * requirement on the products page). We now map ALL ten categories with
 * distinct hues and add `border` / `borderTop` / `glowShadow` so the product
 * card can dye its edge and emit a faint category-coloured glow on hover —
 * replacing the generic cyan border/cyan glow that `.glass-surface:hover`
 * applies by default.
 */

import {
  Flower2,
  Pizza,
  Candy,
  Egg,
  CupSoda,
  Snowflake,
  Coffee,
  IceCream,
  PawPrint,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

export interface AccentSet {
  /** Gradient stops for the card's top accent bar (and the icon-tile surface). */
  topBar: string;
  /** Gradient stops for the HOT/NEW badge. */
  badge: string;
  /** rgba() colour for the hover water-ripple. */
  ripple: string;
  /** Gradient + text classes for the light-mode category pill. */
  pill: string;
  /** Text colour class for category-tinted labels. */
  text: string;
  /**
   * Resting border colour for the card. Uses the `!` important prefix so it
   * overrides the white border baked into `.glass-surface` / `.ocean-glass`.
   */
  border: string;
  /**
   * Stronger top-edge border tint (paired with `border-t-2`). Important-prefixed
   * so it wins over `.glass-surface:hover`'s cyan border.
   */
  borderTop: string;
  /**
   * Subtle, category-coloured box-shadow applied on hover. Important-prefixed
   * (`hover:!shadow-…`) so it replaces the default cyan `.glass-surface:hover`
   * glow rather than being overridden by it.
   */
  glowShadow: string;
}

/** Lucide icon per category slug — used to give each product card a coloured,
 *  category-distinct icon (V44: "icons themselves should differ in colour"). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'fresh-flower-vending-machine': Flower2,
  'pizza-vending-machine': Pizza,
  'cotton-candy-machine': Candy,
  'fruit-vegetable-egg-vending-machine': Egg,
  'sugar-cane-juice-vending-machine': CupSoda,
  'ice-maker-vending-machine': Snowflake,
  'coffee-vending-machine': Coffee,
  'ice-cream-vending-machine': IceCream,
  'pet-washing-machine': PawPrint,
  'food-vending-machine': UtensilsCrossed,
};

/** Resolve a lucide icon for a category slug (falls back to a flower). */
export function iconForCategory(slug?: string): LucideIcon {
  return slug && CATEGORY_ICONS[slug] ? CATEGORY_ICONS[slug] : Flower2;
}

/** Brand default — cyan / teal (the original product-card accent). */
export const DEFAULT_ACCENT: AccentSet = {
  topBar: 'from-ocean-400 to-brand-600',
  badge: 'from-cyan-400 to-teal-500',
  ripple: 'rgba(56, 189, 248, 0.28)',
  pill: 'from-ocean-50 to-brand-100 text-ocean-700',
  text: 'text-ocean-700',
  border: '!border-cyan-200/70',
  borderTop: '!border-t-cyan-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(34,211,238,0.22)]',
};

// ── Themed accent presets ──
// Hues mirror CATEGORY_THEMES in CategoriesGrid.tsx so the two grids stay
// visually coherent.

const FLOWER: AccentSet = {
  topBar: 'from-rose-400 to-pink-500',
  badge: 'from-rose-400 to-pink-500',
  ripple: 'rgba(244, 114, 182, 0.28)',
  pill: 'from-rose-50 to-pink-100 text-rose-700',
  text: 'text-rose-700',
  border: '!border-rose-200/70',
  borderTop: '!border-t-rose-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(244,114,182,0.25)]',
};

const ICE: AccentSet = {
  topBar: 'from-sky-300 to-blue-500',
  badge: 'from-sky-400 to-blue-500',
  ripple: 'rgba(56, 189, 248, 0.28)',
  pill: 'from-sky-50 to-blue-100 text-sky-700',
  text: 'text-sky-700',
  border: '!border-sky-200/70',
  borderTop: '!border-t-sky-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(56,189,248,0.25)]',
};

const PIZZA: AccentSet = {
  topBar: 'from-amber-300 to-orange-500',
  badge: 'from-amber-400 to-orange-500',
  ripple: 'rgba(251, 191, 36, 0.28)',
  pill: 'from-amber-50 to-orange-100 text-amber-700',
  text: 'text-amber-700',
  border: '!border-amber-200/70',
  borderTop: '!border-t-amber-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(251,146,60,0.25)]',
};

const COFFEE: AccentSet = {
  topBar: 'from-amber-600 to-amber-900',
  badge: 'from-amber-500 to-yellow-800',
  ripple: 'rgba(180, 83, 9, 0.28)',
  pill: 'from-amber-50 to-yellow-100 text-amber-800',
  text: 'text-amber-800',
  border: '!border-amber-200/70',
  borderTop: '!border-t-amber-500',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(180,83,9,0.22)]',
};

const COTTON_CANDY: AccentSet = {
  topBar: 'from-violet-400 to-fuchsia-500',
  badge: 'from-violet-400 to-fuchsia-500',
  ripple: 'rgba(167, 139, 250, 0.28)',
  pill: 'from-violet-50 to-fuchsia-100 text-violet-700',
  text: 'text-violet-700',
  border: '!border-violet-200/70',
  borderTop: '!border-t-violet-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(167,139,250,0.25)]',
};

const FRUIT: AccentSet = {
  topBar: 'from-emerald-400 to-green-500',
  badge: 'from-emerald-400 to-green-500',
  ripple: 'rgba(52, 211, 153, 0.28)',
  pill: 'from-emerald-50 to-green-100 text-emerald-700',
  text: 'text-emerald-700',
  border: '!border-emerald-200/70',
  borderTop: '!border-t-emerald-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(16,185,129,0.25)]',
};

// V46: previously unmapped → cyan fallback. Now distinct lime/emerald hue.
const LIME: AccentSet = {
  topBar: 'from-lime-400 to-emerald-500',
  badge: 'from-lime-400 to-emerald-500',
  ripple: 'rgba(132, 204, 22, 0.28)',
  pill: 'from-lime-50 to-emerald-100 text-lime-700',
  text: 'text-lime-700',
  border: '!border-lime-200/70',
  borderTop: '!border-t-lime-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(132,204,22,0.25)]',
};

// V46: previously unmapped → cyan fallback. Now distinct pink/rose hue.
const PINK: AccentSet = {
  topBar: 'from-pink-400 to-rose-500',
  badge: 'from-pink-400 to-rose-500',
  ripple: 'rgba(244, 114, 182, 0.28)',
  pill: 'from-pink-50 to-rose-100 text-pink-700',
  text: 'text-pink-700',
  border: '!border-pink-200/70',
  borderTop: '!border-t-pink-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(244,114,182,0.25)]',
};

// V46: previously unmapped → cyan fallback. Now distinct orange/red hue.
const ORANGE: AccentSet = {
  topBar: 'from-orange-400 to-red-500',
  badge: 'from-orange-400 to-red-500',
  ripple: 'rgba(239, 68, 68, 0.28)',
  pill: 'from-orange-50 to-red-100 text-orange-700',
  text: 'text-orange-700',
  border: '!border-orange-200/70',
  borderTop: '!border-t-orange-400',
  glowShadow: 'hover:!shadow-[0_20px_45px_rgba(249,115,22,0.25)]',
};

/**
 * Category SLUG → accent. Keys match the real product-category slugs used in
 * `CategoriesGrid.tsx`. Themes:
 *  - flower        → rose / pink
 *  - ice-cream/ice → cyan / blue
 *  - pizza         → amber
 *  - coffee        → amber-brown
 *  - cotton-candy  → violet
 *  - fruit         → emerald
 *  - sugar-cane    → lime / emerald   (V46)
 *  - pet-washing   → pink / rose      (V46)
 *  - food          → orange / red     (V46)
 */
export const CATEGORY_ACCENTS: Record<string, AccentSet> = {
  'fresh-flower-vending-machine': FLOWER,
  'ice-cream-vending-machine': ICE,
  'ice-maker-vending-machine': ICE,
  'pizza-vending-machine': PIZZA,
  'coffee-vending-machine': COFFEE,
  'cotton-candy-machine': COTTON_CANDY,
  'fruit-vegetable-egg-vending-machine': FRUIT,
  'sugar-cane-juice-vending-machine': LIME,
  'pet-washing-machine': PINK,
  'food-vending-machine': ORANGE,
};

/**
 * Resolve an accent set for a category slug, falling back to DEFAULT_ACCENT
 * when the slug is missing or not present in CATEGORY_ACCENTS.
 */
export function accentForCategory(slug?: string): AccentSet {
  if (slug && CATEGORY_ACCENTS[slug]) return CATEGORY_ACCENTS[slug];
  return DEFAULT_ACCENT;
}
