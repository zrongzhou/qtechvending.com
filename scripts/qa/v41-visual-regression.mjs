// V41 Visual Regression — QA automated browser checks (Playwright).
//
// Validates the 6 V41 visual fixes + 1 new feature:
//   1. Starfield — fewer/refined stars, animating (home)
//   2. Advantages — calmer cards (4 cards, less blur, higher contrast)
//   3. Cases — 6 per-card colour themes (distinct hues)
//   4. CTA — full-width dark-glass block (width > 80% viewport)
//   5. Product detail — Tab switcher (Features/Specs/Description) + animate-fade-in
//   6. About — full rebuild: 12 sections, OceanBubbles, deep-space hero
//
// Plus: HTTP 200 on all routes, i18n (en/zh/ar) SSR lang/dir, broken-image
// (404) sweep, and JS-exception capture.
//
// NOTE: There is NO PostgreSQL in this QA environment (no .env / DATABASE_URL,
// port 5432 closed). The data layer degrades gracefully so pages still render
// HTTP 200 with empty data. The product-detail Tab is exercised through a QA
// harness route (/en/qa-product-tab) that mounts the REAL <ProductDetailView>
// with a deterministic mock product, because the live slug route 404s without a
// DB. See src/app/[locale]/qa-product-tab/page.tsx.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3002';
const ART = path.resolve(process.cwd(), 'scripts/qa/v41-artifacts');
fs.mkdirSync(ART, { recursive: true });

const pageErrors = [];
const results = [];

async function waitForServer(timeoutMs = 240000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/en`);
      if (res.ok) return true;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

// ── Starfield: sample canvas pixel-sum twice, assert it changed (animating) ──
async function checkStarfield(page) {
  const sel = '.starfield canvas';
  const count = await page.locator(sel).count();
  if (count === 0) return { ok: false, reason: 'no .starfield canvas', count: 0 };
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
  await page.waitForTimeout(900);
  const b = await sample();
  const diff = Math.abs(a - b);
  return { ok: diff > 50, diff, count };
}

// Attach a broken-image (>=400) collector for the duration of one navigation.
function attachBroken(page) {
  const broken = [];
  const handler = (resp) => {
    const u = resp.url();
    const ct = resp.headers()['content-type'] || '';
    const isImg =
      /\.(webp|png|jpe?g|gif|svg|avif)(\?|$)/i.test(u) || ct.startsWith('image/');
    if (isImg && resp.status() >= 400) broken.push({ u, s: resp.status() });
  };
  page.on('response', handler);
  return { broken, handler };
}
const detachBroken = (page, hook) => {
  page.off('response', hook.handler);
  return hook.broken;
};

async function main() {
  const ready = await waitForServer(240000);
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

  // ───────────────────────── HOME (en / zh / ar) ─────────────────────────
  for (const loc of ['en', 'zh', 'ar']) {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/${loc}`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2800); // starfield frames + reveal animations
    } catch (e) {
      status = -1;
    }
    const broken = detachBroken(page, hook);

    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    const htmlDir = await page.evaluate(() => document.documentElement.dir);
    const i18nOk =
      loc === 'ar'
        ? htmlLang === 'ar' && htmlDir === 'rtl'
        : htmlLang === loc && htmlDir === 'ltr';

    const starfield = await checkStarfield(page);

    const advantages = await page.evaluate(() => {
      const sec = Array.from(document.querySelectorAll('section')).find((s) =>
        s.className.includes('bg-atmosphere-blue'),
      );
      if (!sec) return { ok: false, count: 0, reason: 'no Advantages section' };
      const n = sec.querySelectorAll('h3.text-ink-900').length;
      return { ok: n === 4, count: n };
    });

    const cases = await page.evaluate(() => {
      // Both Hero and Cases use bg-[#0a0e1a]; choose the one with 6 glass-card-dark cards.
      const sec = Array.from(document.querySelectorAll('section')).find((s) => {
        if (!s.className.includes('bg-[#0a0e1a]')) return false;
        return s.querySelectorAll('.glass-card-dark').length >= 6;
      });
      if (!sec) return { ok: false, count: 0, distinct: 0, reason: 'no Cases section' };
      // Top accent bars only (h-1 + top-0); the bottom decorative line lacks top-0.
      const bars = Array.from(sec.querySelectorAll('span.h-1.top-0'));
      const grads = bars.map((b) => getComputedStyle(b).backgroundImage);
      const distinct = new Set(grads).size;
      return { ok: bars.length === 6 && distinct >= 3, count: bars.length, distinct };
    });

    const cta = await page.evaluate(() => {
      const el = document.querySelector('.cta-aqua');
      if (!el) return { ok: false, width: 0, vw: window.innerWidth, ratio: 0 };
      const w = el.getBoundingClientRect().width;
      const vw = window.innerWidth;
      return { ok: w > vw * 0.8, width: Math.round(w), vw, ratio: +(w / vw).toFixed(3) };
    });

    const shot = path.join(ART, `home-${loc}.png`);
    await page.screenshot({ path: shot });

    results.push({
      page: `home-${loc}`,
      url: `/${loc}`,
      status,
      i18nOk,
      htmlLang,
      htmlDir,
      starfield,
      advantagesCards: advantages,
      casesColors: cases,
      ctaFullWidth: cta,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ───────────────────────── PRODUCTS LIST ─────────────────────────
  {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/en/products`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2500);
    } catch {
      status = -1;
    }
    const broken = detachBroken(page, hook);
    const shot = path.join(ART, 'products.png');
    await page.screenshot({ path: shot });
    results.push({ page: 'products-list', url: '/en/products', status, brokenImages: broken, screenshot: shot });
  }

  // ───────────────────────── PRODUCT DETAIL TAB (harness) ─────────────────────────
  {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/en/qa-product-tab`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2000);
    } catch {
      status = -1;
    }
    const broken = detachBroken(page, hook);

    const tabs = page.locator('button[aria-pressed]');
    const tabCount = await tabs.count();

    const featVisibleInit = await page.getByText('QA_FEATURE_ONE').isVisible().catch(() => false);

    // Click the Specs tab (index 1).
    let specsOk = false;
    let featHiddenAfterSpecs = false;
    if (tabCount >= 2) {
      await tabs.nth(1).click();
      await page.waitForTimeout(700);
      specsOk = await page.getByText('QA_SPEC_PARAM').isVisible().catch(() => false);
      featHiddenAfterSpecs = !(await page.getByText('QA_FEATURE_ONE').isVisible().catch(() => true));
    }

    // Click the Description tab (index 2).
    let descOk = false;
    if (tabCount >= 3) {
      await tabs.nth(2).click();
      await page.waitForTimeout(700);
      descOk = await page.getByText('QA_DESCRIPTION_TEXT').isVisible().catch(() => false);
    }

    const fadeInClass = await page.evaluate(() => {
      const el = document.querySelector('div.animate-fade-in');
      return el ? el.className.includes('animate-fade-in') : false;
    });

    const shot = path.join(ART, 'product-tab.png');
    await page.screenshot({ path: shot });

    results.push({
      page: 'product-tab',
      url: '/en/qa-product-tab',
      status,
      tabCount,
      tabCountOk: tabCount === 3,
      featuresDefaultVisible: featVisibleInit,
      specsSwitchOk: specsOk && featHiddenAfterSpecs,
      descriptionSwitchOk: descOk,
      animateFadeInClass: fadeInClass,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ───────────────────────── ABOUT (en / zh / ar) ─────────────────────────
  for (const loc of ['en', 'zh', 'ar']) {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/${loc}/about`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2500);
    } catch {
      status = -1;
    }
    const broken = detachBroken(page, hook);

    const about = await page.evaluate(() => {
      const main = document.querySelector('main');
      const sections = main ? main.querySelectorAll('section') : [];
      // Hero is the first <section> inside main.
      const hero = main ? main.querySelector('section') : null;
      const heroBg = hero ? getComputedStyle(hero).backgroundImage : '';
      const deepSpace = /rgb\(10,\s*14,\s*26\)/.test(heroBg) || heroBg.includes('#0a0e1a');
      const canvases = main ? main.querySelectorAll('canvas') : [];
      return {
        sectionCount: sections.length,
        heroDeepSpace: deepSpace,
        heroBg,
        oceanBubblesCanvas: canvases.length,
      };
    });

    const shot = path.join(ART, `about-${loc}.png`);
    await page.screenshot({ path: shot });

    results.push({
      page: `about-${loc}`,
      url: `/${loc}/about`,
      status,
      sectionCount: about.sectionCount,
      sectionCountOk: about.sectionCount >= 12,
      heroDeepSpace: about.heroDeepSpace,
      oceanBubblesCanvas: about.oceanBubblesCanvas,
      oceanBubblesOk: about.oceanBubblesCanvas >= 1,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  await browser.close();

  const out = { base: BASE, results, pageErrors };
  fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
