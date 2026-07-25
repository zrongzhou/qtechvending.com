#!/usr/bin/env node
/**
 * Generate responsive width variants for above-the-fold (hero / LCP) images.
 *
 * WHY THIS EXISTS
 * ---------------
 * next.config.mjs sets `images.unoptimized: true` ON PURPOSE: the local
 * webp/avif assets are already pre-compressed, and next/image's server-side
 * optimization was measured as slower (5.7s) and caused a white-flash on the
 * about page. With `unoptimized: true`, next/image does NOT emit a responsive
 * `srcset` — so every device downloads the full-size hero webp regardless of
 * its actual rendered width. This script pre-generates smaller width variants
 * so the hero markup can use a native `<img srcset sizes>` and the browser
 * downloads only the size it needs.
 *
 * DESIGN CONSTRAINTS (see perf-audit task brief)
 * ----------------------------------------------
 * - Hero *source* images are 576x1024 (portrait). To honour the "largest
 *   variant must still cover desktop/retina and must not look blurry"
 *   guardrail we never upscale beyond the source width. Generated variant
 *   widths are therefore capped BELOW 576; the ORIGINAL source file remains the
 *   largest srcset entry (zero quality regression on desktop/retina).
 * - We deliberately do NOT generate variants for all ~303 images in
 *   /public/images — only the first-screen hero images are targeted, because
 *   they dominate the above-the-fold (LCP) transfer.
 *
 * OUTPUT
 * ------
 * For each source `public/images/hero/hero-product-N.webp` we emit, next to it:
 *   public/images/hero/hero-product-N-384.webp   (384w)
 *   public/images/hero/hero-product-N-512.webp   (512w)
 * The original `...-N.webp` (576w) is reused as the largest srcset entry by the
 * front-end helper (src/lib/responsive-images.ts -> buildSrcSet).
 *
 * NOTE: /public/images/hero is NOT gitignored (only products/blog/about are),
 * so the generated variants are committed normally — no `git add -f` and no
 * server-side generation step required. The output is deterministic; re-running
 * the script simply overwrites the variants.
 *
 * RUN
 * ---
 *   node scripts/gen-responsive-images.mjs
 *   (also exposed as: npm run images:responsive)
 */

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join, parse } from 'node:path';
import { statSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Above-the-fold hero sources — the landing-page LCP carousel (6 images).
// ALL six are on the first screen (they sit stacked in the same hero card and
// are within the initial viewport, so the browser loads them on first paint).
const HERO_SOURCES = [
  'public/images/hero/hero-product-1.webp',
  'public/images/hero/hero-product-2.webp',
  'public/images/hero/hero-product-3.webp',
  'public/images/hero/hero-product-4.webp',
  'public/images/hero/hero-product-5.webp',
  'public/images/hero/hero-product-6.webp',
];

// Generated variant widths. Capped below the 576px source width so we never
// upscale (which would blur on desktop/retina). MUST stay in sync with
// HERO_VARIANT_WIDTHS in src/lib/responsive-images.ts.
const VARIANT_WIDTHS = [384, 512];

// WebP encoding settings. effort 6 is a good quality/speed trade-off for a
// one-off build-time asset generation step.
const WEBP_QUALITY = 82;
const WEBP_EFFORT = 6;

/**
 * Generate the configured width variants for a single source image.
 * @param {string} relSrc Source path relative to repo root.
 * @returns {Promise<{sourceWidth:number,sourceBytes:number,results:Array<{outRel:string,bytes:number,width:number}>}>}
 */
async function generateOne(relSrc) {
  const absSrc = join(ROOT, relSrc);
  const { name, dir } = parse(absSrc);

  const meta = await sharp(absSrc).metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceBytes = statSync(absSrc).size;

  mkdirSync(dir, { recursive: true });

  const results = [];
  for (const w of VARIANT_WIDTHS) {
    if (sourceWidth > 0 && w >= sourceWidth) {
      // Never upscale — skip variants wider than (or equal to) the source so
      // desktop/retina keep the original's full quality.
      console.log(`  skip ${name}-${w}.webp (>= source ${sourceWidth}w, would upscale)`);
      continue;
    }
    const outRel = join('public/images/hero', `${name}-${w}.webp`);
    const outAbs = join(ROOT, outRel);
    await sharp(absSrc)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
      .toFile(outAbs);
    const bytes = statSync(outAbs).size;
    results.push({ outRel, bytes, width: w });
  }

  return { sourceWidth, sourceBytes, results };
}

async function main() {
  console.log(
    `Generating responsive hero variants for ${HERO_SOURCES.length} source image(s)...\n`,
  );

  let generated = 0;
  for (const rel of HERO_SOURCES) {
    const { sourceWidth, sourceBytes, results } = await generateOne(rel);
    console.log(
      `${rel}  (source ${sourceWidth}w, ${(sourceBytes / 1024).toFixed(1)}KB):`,
    );
    for (const r of results) {
      const pct = sourceBytes > 0 ? (100 * (1 - r.bytes / sourceBytes)).toFixed(0) : '0';
      console.log(
        `  -> ${r.outRel}  ${(r.bytes / 1024).toFixed(1)}KB  (${pct}% smaller than source @${sourceWidth}w)`,
      );
      generated += 1;
    }
  }

  console.log(
    `\nDone. ${generated} variant file(s) written next to their sources in public/images/hero/.`,
  );
  console.log(
    'These files are committed normally (hero dir is not gitignored). Re-run any time the',
  );
  console.log('hero source images change. The original file stays the largest srcset entry.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
