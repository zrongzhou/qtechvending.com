// V40 Visual Regression — QA automated browser checks (Playwright).
//
// Validates the 6 V40 visual fixes:
//   1. Starfield deep-space animated canvas (home)
//   2. Cases dark-glass (covered indirectly via page render)
//   3. CTA glass-aquarium (bubbles / plankton / godrays)
//   4. Products dark ocean background
//   5. About dark immersive background
//   6. Hero Aurora unchanged (page still renders)
//
// Plus: HTTP 200 on all routes, i18n (en/zh/ar) routing, and a broken-.webp
// (404) sweep across every visited page.
//
// The data layer degrades to empty data when the DB is unreachable, so the
// pages still render (HTTP 200) and the visual elements below are exercised
// without a live database.

import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const ART = path.resolve(process.cwd(), 'scripts/qa/v40-artifacts');
fs.mkdirSync(ART, { recursive: true });

const REDIRECT_PAGES = [
  { key: 'root', url: '/' },
  { key: 'products', url: '/products' },
  { key: 'about', url: '/about' },
];
const LOCALE_HOME = [
  { key: 'home-en', url: '/en', locale: 'en' },
  { key: 'home-zh', url: '/zh', locale: 'zh' },
  { key: 'home-ar', url: '/ar', locale: 'ar' },
];
const DARK_PAGES = [
  { key: 'products', url: '/products' },
  { key: 'about', url: '/about' },
];

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function medianLuminanceOfPng(buf) {
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;
  const lums = [];
  const stepX = Math.max(1, Math.floor(width / 40));
  const stepY = Math.max(1, Math.floor(height / 40));
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = (y * width + x) * 4;
      lums.push(lum(data[i], data[i + 1], data[i + 2]));
    }
  }
  lums.sort((a, b) => a - b);
  const median = lums[Math.floor(lums.length / 2)] ?? 0;
  const bright = lums.filter((v) => v > 140).length;
  return { median: Math.round(median), brightFraction: +(bright / lums.length).toFixed(3) };
}

async function waitForServer(timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/en`);
      if (res.ok) return true;
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function checkStarfield(page) {
  const sel = '.starfield canvas';
  const count = await page.locator(sel).count();
  if (count === 0) return { ok: false, reason: 'no .starfield canvas found', count: 0 };
  await page
    .waitForFunction(
      (s) => {
        const c = document.querySelector(s);
        return c && c.width > 10 && c.height > 10;
      },
      sel,
      { timeout: 10000 },
    )
    .catch(() => {});
  const sample = () =>
    page.evaluate((s) => {
      const c = document.querySelector(s);
      const ctx = c.getContext('2d');
      const w = c.width,
        h = c.height;
      const x = Math.floor(w * 0.15),
        y = Math.floor(h * 0.15);
      const sw = Math.max(1, Math.floor(w * 0.7)),
        sh = Math.max(1, Math.floor(h * 0.7));
      const d = ctx.getImageData(x, y, sw, sh).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2] + d[i + 3];
      return sum;
    }, sel);
  const a = await sample();
  await page.waitForTimeout(1000);
  const b = await sample();
  const diff = Math.abs(a - b);
  return { ok: diff > 50, diff, count };
}

async function checkCta(page) {
  const ctaAqua = await page.locator('.cta-aqua').count();
  const bubbles = await page.locator('.cta-bubble').count();
  const plankton = await page.locator('.cta-plankton').count();
  const godray = await page.locator('.cta-godray').count();
  const ok = ctaAqua >= 1 && bubbles > 0 && plankton > 0 && godray > 0;
  return { ok, ctaAqua, bubbles, plankton, godray };
}

const results = [];
const pageErrors = [];

async function main() {
  const ready = await waitForServer(120000);
  if (!ready) {
    console.error('SERVER_NOT_READY');
    process.exit(2);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));

  const attachBroken = () => {
    const broken = [];
    const handler = (resp) => {
      const u = resp.url();
      const ct = resp.headers()['content-type'] || '';
      const isImg = u.includes('.webp') || ct.startsWith('image/');
      if (isImg && resp.status() >= 400) broken.push({ u, s: resp.status() });
    };
    page.on('response', handler);
    return { broken, handler };
  };
  const detachBroken = ({ broken, handler }) => {
    page.off('response', handler);
    return broken;
  };

  // ---- Redirect / locale-home pages (200 + starfield + cta + i18n) ----
  for (const p of [...REDIRECT_PAGES, ...LOCALE_HOME]) {
    const hook = attachBroken();
    let status = -1;
    let finalUrl = '';
    try {
      const resp = await page.goto(`${BASE}${p.url}`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      finalUrl = page.url();
      await page.waitForTimeout(2000);
    } catch (e) {
      status = -1;
      finalUrl = String(e.message || e);
    }
    const broken = detachBroken(hook);

    const rec = { key: p.key, url: p.url, finalUrl, status, brokenWebp: broken };
    const isHome = LOCALE_HOME.some((l) => l.key === p.key);
    if (isHome) {
      rec.starfield = await checkStarfield(page);
      rec.cta = await checkCta(page);
      rec.htmlLang = await page.evaluate(() => document.documentElement.lang);
      rec.expectedLocale = p.locale;
      rec.i18nOk = rec.htmlLang === p.locale;
      const shot = path.join(ART, `${p.key}.png`);
      await page.screenshot({ path: shot });
      rec.screenshot = shot;
    }
    results.push(rec);
  }

  // ---- Dark-background pages (products / about) ----
  // The assertion is based on the *screenshot* luminance because it faithfully
  // captures the actually painted background.  CSS-gradient-stop parsing alone
  // is not reliable here: translucent cyan accent overlays (e.g. sunlight sheen
  // at 15% opacity, badges) are intentionally bright but do not represent the
  // page background.
  for (const p of DARK_PAGES) {
    const hook = attachBroken();
    let status = -1;
    let finalUrl = '';
    try {
      const resp = await page.goto(`${BASE}${p.url}`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      finalUrl = page.url();
      await page.waitForTimeout(2000);
    } catch (e) {
      status = -1;
      finalUrl = String(e.message || e);
    }
    const broken = detachBroken(hook);

    const shot = path.join(ART, `${p.key}.png`);
    const buf = await page.screenshot({ path: shot });
    const lumStats = medianLuminanceOfPng(buf);

    results.push({
      key: p.key,
      url: p.url,
      finalUrl,
      status,
      brokenWebp: broken,
      screenshot: shot,
      medianLum: lumStats.median,
      brightFraction: lumStats.brightFraction,
      darkOk: lumStats.median < 140 && lumStats.brightFraction < 0.4,
    });
  }

  await browser.close();

  const out = { results, pageErrors };
  fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
