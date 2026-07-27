// V43 Visual Regression — QA automated browser checks (Playwright).
//
// Validates the V43 visual redesign: a shift from the dark "immersive" theme to
// a LIGHT, crystal-glass aesthetic (Apple / Vercel / Linear style). The 5 fixes
// + 1 new component under test:
//   1. CTA aquarium      → translucent seawater tank (rgba(22,78,99)→rgba(17,94,89)
//                          →rgba(22,78,99)) with sun(__sun)/lamp(__lamp), 4 bright
//                          god-rays, 18 crystalline bubbles, 26 drifting plankton.
//   2. Products list     → light glass (bg-glass-light + OceanGlassCard surface="glass"
//                          + text-ink-900).
//   3. Product detail    → light-glass Tabs (glass-surface bar; panels
//                          bg-white/70 backdrop-blur-xl; active text-cyan-700).
//   4. About page        → LIGHT rebuild (root from-white via-slate-50 to-cyan-50/40,
//                          all glass-surface, OceanBubbles tone="light", no CiPaiFrame,
//                          single dark anchor = bottom CTA).
//   5. (glass token)     → .glass-surface / .bg-glass-light utility added to globals.
//   6. PartnersSection   → NEW horizontal logo strip (8 monogram glass tiles) on Home,
//                          inserted between Advantages and StatsBand.
//
// Plus: HTTP 200 on all routes; i18n (en/zh/ar) SSR lang/dir; broken-image (404)
// sweep; Starfield animation running; median-luminance brightness sanity.
//
// NOTE: No PostgreSQL in this QA env. Data layers degrade to empty, so content
// pages still render HTTP 200. The live /en/products/<slug> route calls
// notFound() (empty DB) — so the product-detail Tabs are exercised through the
// REAL-component QA harness route /en/qa-product-tab (mounts REAL
// <ProductDetailView> with a mock product).

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const ART = path.resolve(process.cwd(), 'scripts/qa/v43-artifacts');
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

// ── broken-image (404) collector ──
function attachBroken(page) {
  const broken = [];
  const handler = (resp) => {
    const u = resp.url();
    const ct = resp.headers()['content-type'] || '';
    const isImg = /\.(webp|png|jpe?g|gif|svg|avif)(\?|$)/i.test(u) || ct.startsWith('image/');
    if (isImg && resp.status() >= 400) broken.push({ u, s: resp.status() });
  };
  page.on('response', handler);
  return { broken, handler };
}
const detachBroken = (page, hook) => {
  page.off('response', hook.handler);
  return hook.broken;
};

// ── median luminance from a screenshot PNG ──
function medianLum(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const { width, height, data } = png;
  const lum = new Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    lum[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  lum.sort((a, b) => a - b);
  return Math.round(lum[Math.floor(lum.length / 2)]);
}

const norm = (s) => (s || '').replace(/\s+/g, '');

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

  try {
    // ═══════════════ HOME (en / zh / ar) ═══════════════
    for (const loc of ['en', 'zh', 'ar']) {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/${loc}`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2500);
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

      // (b) CTA aquarium crystal visibility — scroll it into view first so the
      // reveal completes and styles are stable.
      await page.evaluate(() => {
        const el = document.querySelector('.cta-aqua');
        if (el) el.scrollIntoView({ block: 'center' });
      });
      await page.waitForTimeout(1500);

      const cta = await page.evaluate(() => {
        const norm = (s) => (s || '').replace(/\s+/g, '');
        const sec = document.querySelector('.cta-aqua');
        if (!sec) return { ok: false, reason: 'no .cta-aqua' };
        const cs = getComputedStyle(sec);
        const bg = norm(cs.backgroundImage);
        const hasSea = bg.includes('rgba(22,78,99') || bg.includes('rgb(22,78,99');
        const isBlack = bg.includes('rgb(10,14,26') || bg.includes('rgb(15,23,42');
        const bubbles = [...document.querySelectorAll('.cta-bubble')];
        const bubbleInfo = bubbles.map((b) => {
          const s = getComputedStyle(b);
          return { border: norm(s.border), borderColor: norm(s.borderColor), opacity: parseFloat(s.opacity) };
        });
        const crystalBubble = bubbleInfo.find(
          (b) => /rgba\(255,255,255,0\.6\)/.test(b.border) || /rgba\(255,255,255,0\.6\)/.test(b.borderColor),
        );
        const maxBubbleOpacity = bubbleInfo.length ? Math.max(...bubbleInfo.map((b) => b.opacity)) : 0;
        const godrays = [...document.querySelectorAll('.cta-godray')];
        const godrayOpacities = godrays.map((g) => parseFloat(getComputedStyle(g).opacity));
        const maxGodrayOpacity = godrayOpacities.length ? Math.max(...godrayOpacities) : 0;
        const sun = !!document.querySelector('.cta-aqua__sun');
        const lamp = !!document.querySelector('.cta-aqua__lamp');
        const ok =
          hasSea &&
          !isBlack &&
          bubbles.length > 10 &&
          !!crystalBubble &&
          maxBubbleOpacity > 0.4 &&
          godrays.length === 4 &&
          maxGodrayOpacity > 0.4 &&
          sun &&
          lamp;
        return {
          ok,
          hasSea,
          isBlack,
          backgroundImage: cs.backgroundImage.slice(0, 160),
          bubbleCount: bubbles.length,
          crystalBubbleBorder: crystalBubble ? crystalBubble.border : null,
          maxBubbleOpacity,
          godrayCount: godrays.length,
          maxGodrayOpacity,
          sun,
          lamp,
        };
      });

      // (d) PartnersSection — 8 monogram glass tiles in a horizontal strip.
      const partners = await page.evaluate(() => {
        const secs = [...document.querySelectorAll('section.bg-glass-light')];
        for (const sec of secs) {
          const sc = sec.querySelector('.no-scrollbar');
          if (sc) {
            const tiles = sc.querySelectorAll('[class*="h-28"]');
            if (tiles.length >= 8) {
              return { found: true, tileCount: tiles.length, hasScroll: !!sc };
            }
          }
        }
        // fallback: any section whose inner text mentions partners + 8 h-28 tiles
        const all = [...document.querySelectorAll('section')];
        for (const sec of all) {
          if (/partners/i.test(sec.innerText)) {
            const tiles = sec.querySelectorAll('[class*="h-28"]');
            if (tiles.length >= 8) return { found: true, tileCount: tiles.length, hasScroll: !!sec.querySelector('.no-scrollbar') };
          }
        }
        return { found: false, tileCount: 0, hasScroll: false };
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
        starfieldAnimating: starfield.ok,
        ctaAqua: cta,
        ctaVisible: cta.ok,
        partners,
        partnersRendered: partners.found && partners.tileCount === 8,
        brokenImages: broken,
        screenshot: shot,
      });
    }

    // ═══════════════ PRODUCTS LIST (live, light glass) ═══════════════
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

      const productsBg = await page.evaluate(() => {
        const norm = (s) => (s || '').replace(/\s+/g, '');
        const root = document.querySelector('.bg-glass-light');
        if (!root) return { ok: false, reason: 'no .bg-glass-light root' };
        const cs = getComputedStyle(root);
        const bg = norm(cs.backgroundImage);
        const hasGradient = /gradient/.test(bg);
        const hasLight =
          bg.includes('rgb(248,250,252)') || // slate-50 #f8fafc
          bg.includes('rgb(240,249,255)') || // sky-50   #f0f9ff
          bg.includes('rgb(240,253,250)') || // teal-50  #f0fdfa
          bg.includes('rgb(255,255,255)');
        const isBlack = bg.includes('rgb(10,14,26)') || bg.includes('rgb(15,23,42)');
        return {
          ok: hasGradient && hasLight && !isBlack,
          hasGradient,
          hasLight,
          isBlack,
          backgroundImage: cs.backgroundImage.slice(0, 200),
        };
      });

      const shot = path.join(ART, 'products.png');
      await page.screenshot({ path: shot });
      const lum = medianLum(shot);
      results.push({
        page: 'products-list',
        url: '/en/products',
        status,
        productsBackground: productsBg,
        productsLightGlass: productsBg.ok,
        medianLum: lum,
        lightEnough: lum > 180,
        brokenImages: broken,
        screenshot: shot,
      });
    }

    // ═══════════════ PRODUCT DETAIL — TAB PANELS light glass (harness) ═══════════════
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

      // Tab bar is `.glass-surface.flex.gap-1.overflow-x-auto` in V43 — scoped so
      // we NEVER match the gallery's `aria-pressed` thumbnail buttons (also inside
      // a .glass-surface), which would open the Lightbox and intercept clicks.
      const tabs = page.locator('.glass-surface.flex.gap-1.overflow-x-auto button[aria-pressed]');
      const tabCount = await tabs.count();
      const panels = [];
      let lightGlassOk = true;
      for (let i = 0; i < tabCount; i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(600);
        const p = await page.evaluate(() => {
          const af = document.querySelector('.animate-fade-in');
          if (!af || !af.firstElementChild) return { found: false };
          const panel = af.firstElementChild;
          const s = getComputedStyle(panel);
          return { found: true, backgroundColor: s.backgroundColor };
        });
        panels.push(p);
        if (!p.found) {
          lightGlassOk = false;
          continue;
        }
        const m = p.backgroundColor.match(/rgba?\(([^)]+)\)/);
        if (!m) {
          lightGlassOk = false;
          continue;
        }
        const parts = m[1].split(',').map((x) => parseFloat(x));
        const sum = parts[0] + parts[1] + parts[2];
        const alpha = parts[3];
        // Light glass: translucent white (sum 765) with alpha 0.4–0.95 — i.e.
        // rgba(255,255,255,0.7). Not pure white (alpha 1) and not black (< 300).
        const isLightGlass = sum > 700 && alpha !== undefined && alpha > 0.4 && alpha < 0.95;
        if (!isLightGlass) lightGlassOk = false;
      }

      const shot = path.join(ART, 'qa-product-tab.png');
      await page.screenshot({ path: shot });
      results.push({
        page: 'qa-product-tab',
        url: '/en/qa-product-tab',
        status,
        tabCount,
        tabCountOk: tabCount === 3,
        panels,
        lightGlassOk,
        tabPanelsLightGlass: lightGlassOk,
        brokenImages: broken,
        screenshot: shot,
      });
    }

    // ═══════════════ ABOUT (en / zh / ar) — LIGHT rebuild ═══════════════
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

      // (c) Hero/root background = light gradient (white / slate-50 / cyan-50),
      // NOT pure black. Root = `from-white via-slate-50 to-cyan-50/40`.
      const about = await page.evaluate(() => {
        const norm = (s) => (s || '').replace(/\s+/g, '');
        const root = [...document.querySelectorAll('div')].find((d) => {
          const c = d.className || '';
          return /(^|\s)from-white(\s|$)/.test(c) && /(^|\s)via-slate-50(\s|$)/.test(c) && /(^|\s)to-cyan-50/.test(c);
        });
        if (!root) return { ok: false, reason: 'no light root gradient' };
        const cs = getComputedStyle(root);
        const bg = norm(cs.backgroundImage);
        const hasLight =
          bg.includes('rgb(255,255,255)') || // white
          bg.includes('rgb(248,250,252)') || // slate-50
          bg.includes('rgb(236,254,255)') || // cyan-50
          bg.includes('#fff');
        const isBlack = bg.includes('rgb(10,14,26)') || bg.includes('rgb(15,23,42)');
        return {
          ok: hasLight && !isBlack,
          hasLight,
          isBlack,
          backgroundImage: cs.backgroundImage.slice(0, 160),
        };
      });

      const shot = path.join(ART, `about-${loc}.png`);
      await page.screenshot({ path: shot });
      const lum = medianLum(shot);
      results.push({
        page: `about-${loc}`,
        url: `/${loc}/about`,
        status,
        aboutHero: about,
        aboutLightOk: about.ok,
        medianLum: lum,
        lightEnough: lum > 180,
        brokenImages: broken,
        screenshot: shot,
      });
    }
  } catch (runErr) {
    console.error('RUN_ERROR', runErr);
    results.push({ page: 'RUN_ERROR', error: String((runErr && runErr.message) || runErr) });
  } finally {
    await browser.close();

    const out = { base: BASE, results, pageErrors };
    fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify(out, null, 2));
    console.log(JSON.stringify(out, null, 2));
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
