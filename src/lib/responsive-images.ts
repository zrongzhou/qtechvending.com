/**
 * Front-end helpers for wiring pre-generated responsive hero image variants
 * into a native `<img srcset sizes>`.
 *
 * WHY A NATIVE <img> (and not next/image):
 *   next.config.mjs sets `images.unoptimized: true` on purpose (pre-compressed
 *   local webp/avif; next/image server optimization was slower + caused a
 *   white-flash). With `unoptimized: true`, next/image does NOT emit a
 *   responsive srcset, so every device downloads the full-size hero webp. The
 *   variant files produced by scripts/gen-responsive-images.mjs let us build a
 *   real srcset manually and let the browser pick the smallest variant that
 *   fits the rendered width (saving first-load bytes on phones).
 *
 * VARIANT NAMING (must match scripts/gen-responsive-images.mjs):
 *   source : /images/hero/hero-product-1.webp          (576w, original)
 *   variant: /images/hero/hero-product-1-384.webp      (384w)
 *   variant: /images/hero/hero-product-1-512.webp      (512w)
 * The original source file is always the largest srcset entry because we never
 * upscale beyond the 576px source (keeps desktop/retina pixel-crisp).
 */

/** Generated variant widths, in ascending order. Keep in sync with the script. */
export const HERO_VARIANT_WIDTHS = [384, 512] as const;

/** Intrinsic width of the hero source images (576x1024). Used as the largest srcset entry. */
export const HERO_SOURCE_WIDTH = 576;

export interface SrcSetOptions {
  /** Variant widths to include. Defaults to {@link HERO_VARIANT_WIDTHS}. */
  widths?: readonly number[];
  /** Width of the original source file (largest entry). Defaults to {@link HERO_SOURCE_WIDTH}. */
  sourceWidth?: number;
}

/**
 * Build a `srcset` string for a hero image from its original path.
 *
 * @param basePath Original image path, e.g. "/images/hero/hero-product-1.webp".
 * @returns e.g. "/images/hero/hero-product-1-384.webp 384w, /images/hero/hero-product-1-512.webp 512w, /images/hero/hero-product-1.webp 576w"
 */
export function buildSrcSet(basePath: string, options: SrcSetOptions = {}): string {
  const { widths = HERO_VARIANT_WIDTHS, sourceWidth = HERO_SOURCE_WIDTH } = options;
  const dot = basePath.lastIndexOf('.');
  const stem = dot >= 0 ? basePath.slice(0, dot) : basePath;
  const variantEntries = widths.map((w) => `${stem}-${w}.webp ${w}w`);
  const sourceEntry = `${basePath} ${sourceWidth}w`;
  return [...variantEntries, sourceEntry].join(', ');
}

/**
 * `sizes` attribute for the hero carousel image.
 *
 * The hero card spans the full container width below the `lg` breakpoint
 * (1024px) and becomes the right-hand half-column at `lg` and above, so:
 *   - below 1024px: ~100vw
 *   - 1024px and up: ~50vw
 */
export const HERO_IMG_SIZES = '(max-width: 1024px) 100vw, 50vw';
