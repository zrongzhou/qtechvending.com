/**
 * Category accent system (V37 / F6).
 *
 * Maps a product CATEGORY SLUG to a cohesive accent set that is reused across
 * the product cards (top bar, HOT/NEW badge, hover ripple, category pill).
 * Slugs are aligned with the real categories defined in the data layer
 * (see `src/components/home/CategoriesGrid.tsx` CATEGORY_* maps).
 *
 * Unmapped slugs fall back to the brand cyan/teal DEFAULT_ACCENT so the site
 * never renders a "missing" accent.
 */

export interface AccentSet {
  /** Gradient stops for the card's top accent bar. */
  topBar: string;
  /** Gradient stops for the HOT/NEW badge. */
  badge: string;
  /** rgba() color for the hover water-ripple. */
  ripple: string;
  /** Gradient + text classes for the light-mode category pill. */
  pill: string;
  /** Text color class for category-tinted labels. */
  text: string;
}

/** Brand default — cyan / teal (the original product-card accent). */
export const DEFAULT_ACCENT: AccentSet = {
  topBar: 'from-ocean-400 to-brand-600',
  badge: 'from-cyan-400 to-teal-500',
  ripple: 'rgba(56, 189, 248, 0.28)',
  pill: 'from-ocean-50 to-brand-100 text-ocean-700',
  text: 'text-ocean-700',
};

// ── Themed accent presets ──

const FLOWER: AccentSet = {
  topBar: 'from-rose-400 to-pink-500',
  badge: 'from-rose-400 to-pink-500',
  ripple: 'rgba(244, 114, 182, 0.28)',
  pill: 'from-rose-50 to-pink-100 text-rose-700',
  text: 'text-rose-700',
};

const ICE: AccentSet = {
  topBar: 'from-sky-300 to-blue-500',
  badge: 'from-sky-400 to-blue-500',
  ripple: 'rgba(56, 189, 248, 0.28)',
  pill: 'from-sky-50 to-blue-100 text-sky-700',
  text: 'text-sky-700',
};

const PIZZA: AccentSet = {
  topBar: 'from-amber-300 to-orange-500',
  badge: 'from-amber-400 to-orange-500',
  ripple: 'rgba(251, 191, 36, 0.28)',
  pill: 'from-amber-50 to-orange-100 text-amber-700',
  text: 'text-amber-700',
};

const COFFEE: AccentSet = {
  topBar: 'from-amber-600 to-amber-900',
  badge: 'from-amber-500 to-yellow-800',
  ripple: 'rgba(180, 83, 9, 0.28)',
  pill: 'from-amber-50 to-yellow-100 text-amber-800',
  text: 'text-amber-800',
};

const COTTON_CANDY: AccentSet = {
  topBar: 'from-violet-400 to-fuchsia-500',
  badge: 'from-violet-400 to-fuchsia-500',
  ripple: 'rgba(167, 139, 250, 0.28)',
  pill: 'from-violet-50 to-fuchsia-100 text-violet-700',
  text: 'text-violet-700',
};

const FRUIT: AccentSet = {
  topBar: 'from-emerald-400 to-green-500',
  badge: 'from-emerald-400 to-green-500',
  ripple: 'rgba(52, 211, 153, 0.28)',
  pill: 'from-emerald-50 to-green-100 text-emerald-700',
  text: 'text-emerald-700',
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
 */
export const CATEGORY_ACCENTS: Record<string, AccentSet> = {
  'fresh-flower-vending-machine': FLOWER,
  'ice-cream-vending-machine': ICE,
  'ice-maker-vending-machine': ICE,
  'pizza-vending-machine': PIZZA,
  'coffee-vending-machine': COFFEE,
  'cotton-candy-machine': COTTON_CANDY,
  'fruit-vegetable-egg-vending-machine': FRUIT,
  // Unmapped slugs (e.g. sugar-cane-juice, pet-washing, food) fall back to DEFAULT_ACCENT.
};

/**
 * Resolve an accent set for a category slug, falling back to DEFAULT_ACCENT
 * when the slug is missing or not present in CATEGORY_ACCENTS.
 */
export function accentForCategory(slug?: string): AccentSet {
  if (slug && CATEGORY_ACCENTS[slug]) return CATEGORY_ACCENTS[slug];
  return DEFAULT_ACCENT;
}
