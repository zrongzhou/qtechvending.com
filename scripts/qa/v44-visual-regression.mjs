// V44 Visual Regression — QA automated browser checks (Playwright, system Chrome).
//
// Validates the 10 V44 visual fixes against the running dev server. Because the
// QA environment has NO PostgreSQL (no .env), the live home/products pages
// degrade to empty data, so two QA harness routes (following the existing
// /en/qa-product-tab pattern) mount the REAL <CategoriesGrid> and <ProductCard>
// with deterministic mock data to verify the category-theming and product-card
// fixes without a DB.
//
//   1. Starfield   -> bottom fade mask (transparent->white) + meteor speed (code-verified + canvas animating)
//   2. Categories  -> >=6 distinct per-category theme colours (qa-categories harness)
//   3. Advantages   -> no continuous float animation (no animate-float-gentle, card animation-name !== float)
//   4. Partners     -> replaced by 3 testimonial figures with real t() copy
//   5. CTA          -> full-bleed (.cta-aqua width ~ viewport), >=15 bubbles, 4 god rays, sun+lamp
//   6. Products     -> ice-blue blooms (no violet), glass cards backdrop-filter blur, coloured chip, ripple on hover (qa-products-grid harness)
//   7. About stats  -> pale cyan->teal->slate gradient + visible OceanBubbles canvas (animating)
//   8. About copy   -> exactly ONE "About Us" block (merged)
//   9. About cards  -> differentiated (.glass-card-ink dark, .border-s-4 coloured, .flow-bar)
//  10. Values       -> no big 01/02 watermark; small cyan ordinal dot instead

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3002';
const ART = path.resolve(process.cwd(), 'scripts/qa/v44-artifacts');
fs.mkdirSync(ART, { recursive: true });

const pageErrors = [];       // uncaught JS exceptions (the headline "0 JS errors" metric)
const consoleErrors = [];    // console.error messages (DB-down noise expected in this env)
const results = [];
const checks = {};           // structured per-item results

// Localized copy so testimonial / about-title assertions are NOT falsely flagged
// on zh/ar pages by English-only substring matches (the earlier Round 1 false-negatives).
const MSG_DIR = path.join(process.cwd(), 'src', 'messages');
const loadMsg = (loc) => JSON.parse(fs.readFileSync(path.join(MSG_DIR, `${loc}.json`), 'utf8'));
const ABOUT_TITLE = {
  en: loadMsg('en')['about.aboutTitle'],
  zh: loadMsg('zh')['about.aboutTitle'],
  ar: loadMsg('ar')['about.aboutTitle'],
};
// Distinctive substring of the first testimonial quote, per locale.
const TESTI_Q1 = { en: 'most photographed spot', zh: '最出片', ar: 'أصبحت كبائن' };

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

// Sample a canvas pixel-sum a few times and return the max pairwise diff.
async function canvasDiff(page, sel, samples = 3, wait = 500, window = 0.8) {
  const grab = () =>
    page.evaluate(
      ({ s, window }) => {
        const c = document.querySelector(s);
        if (!c) return null;
        const ctx = c.getContext('2d');
        if (!ctx) return null;
        const w = c.width, h = c.height;
        if (w < 2 || h < 2) return null;
        const x = Math.floor(w * (1 - window) / 2), y = Math.floor(h * (1 - window) / 2);
        const sw = Math.max(1, Math.floor(w * window)), sh = Math.max(1, Math.floor(h * window));
        const d = ctx.getImageData(x, y, sw, sh).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2] + d[i + 3];
        return sum;
      },
      { s: sel, window },
    );
  const vals = [];
  for (let i = 0; i < samples; i += 1) {
    const v = await grab();
    if (v === null) return null;
    vals.push(v);
    await page.waitForTimeout(wait);
  }
  let max = 0;
  for (let i = 1; i < vals.length; i += 1) max = Math.max(max, Math.abs(vals[i] - vals[i - 1]));
  return max;
}

async function main() {
  const ready = await waitForServer(240000);
  if (!ready) {
    console.error('SERVER_NOT_READY');
    process.exit(2);
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  try {
    // HOME (en / zh / ar)
    for (const loc of ['en', 'zh', 'ar']) {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/${loc}`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2500);
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);

      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      const htmlDir = await page.evaluate(() => document.documentElement.dir);
      const i18nOk =
        loc === 'ar'
          ? htmlLang === 'ar' && htmlDir === 'rtl'
          : htmlLang === loc && htmlDir === 'ltr';

      // (1) Starfield fade mask + animation
      const starfieldFade = await page.evaluate(() => {
        const sf = document.querySelector('.starfield');
        if (!sf) return { ok: false, reason: 'no .starfield' };
        const mask = [...sf.querySelectorAll('div')].find((d) => {
          const c = d.className || '';
          return /(^|\s)to-white(\s|$)/.test(c) && /(^|\s)bg-gradient-to-b(\s|$)/.test(c) && /(^|\s)bottom-0(\s|$)/.test(c);
        });
        if (!mask) return { ok: false, reason: 'no bottom fade mask' };
        return { ok: true };
      });
      const starfieldAnim = await canvasDiff(page, '.starfield canvas', 3, 700, 0.7);

      await page.evaluate(() => {
        const el = document.querySelector('.cta-aqua');
        if (el) el.scrollIntoView({ block: 'center' });
      });
      await page.waitForTimeout(1500);

      // (3) AdvantagesSection — no continuous float
      const advantages = await page.evaluate(() => {
        const sec = document.querySelector('section.bg-atmosphere-blue');
        if (!sec) return { ok: false, reason: 'no AdvantagesSection' };
        const cards = [...sec.querySelectorAll('.ocean-glass')];
        const anyFloat = cards.some((c) => {
          const n = getComputedStyle(c).animationName;
          return n && n !== 'none' && /float/i.test(n);
        });
        const floatClass = !!document.querySelector('.animate-float-gentle');
        const scaleHover = cards.some((c) => /scale/.test(c.className));
        return { ok: !anyFloat && !floatClass && cards.length > 0, cardCount: cards.length, anyFloat, floatClass, scaleHover };
      });

      // (4) PartnersSection -> testimonials (3 figures, t()-driven copy)
      const testimonials = await page.evaluate((q1) => {
        const figs = [...document.querySelectorAll('figure.glass-surface')].filter((f) => f.querySelector('blockquote'));
        const hasQ1 = figs.some((f) => f.innerText.includes(q1));
        return { ok: figs.length === 3 && hasQ1, count: figs.length, hasQ1 };
      }, TESTI_Q1[loc]);

      // (5) CTA full-bleed aquarium
      const cta = await page.evaluate(() => {
        const sec = document.querySelector('.cta-aqua');
        if (!sec) return { ok: false, reason: 'no .cta-aqua' };
        const rect = sec.getBoundingClientRect();
        const vw = window.innerWidth;
        const fullBleed = Math.abs(rect.width - vw) <= 4;
        const bubbles = document.querySelectorAll('.cta-bubble').length;
        const godrays = document.querySelectorAll('.cta-godray').length;
        const sun = !!document.querySelector('.cta-aqua__sun');
        const lamp = !!document.querySelector('.cta-aqua__lamp');
        return { ok: fullBleed && bubbles >= 15 && godrays === 4 && sun && lamp, fullBleed, width: Math.round(rect.width), vw, bubbles, godrays, sun, lamp };
      });

      const shot = path.join(ART, `home-${loc}.png`);
      await page.screenshot({ path: shot });

      results.push({
        page: `home-${loc}`, url: `/${loc}`, status, i18nOk, htmlLang, htmlDir,
        starfieldFade, starfieldAnimating: starfieldAnim !== null && starfieldAnim > 50, starfieldAnimDiff: starfieldAnim,
        advantages, testimonials, cta, brokenImages: broken, screenshot: shot,
      });

      if (loc === 'en') {
        checks.starfieldFade = { pass: starfieldFade.ok, detail: starfieldFade };
        checks.advantages = { pass: advantages.ok, detail: advantages };
        checks.testimonials = { pass: testimonials.ok, detail: testimonials };
        checks.cta = { pass: cta.ok, detail: cta };
      }
    }

    // (2) CATEGORIES — qa-categories harness
    {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/en/qa-categories`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2000);
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);

      const categories = await page.evaluate(() => {
        const sec = document.querySelector('#machines');
        if (!sec) return { ok: false, reason: 'no #machines section' };
        const links = [...sec.querySelectorAll('a.group')];
        const bars = links
          .map((a) => {
            const bar = a.querySelector('span.bg-gradient-to-r');
            return bar ? getComputedStyle(bar).backgroundImage : null;
          })
          .filter(Boolean);
        const distinct = new Set(bars).size;
        const icons = links.filter((a) => a.querySelector('svg')).length;
        return { ok: links.length >= 6 && distinct >= 6, cardCount: links.length, distinctBars: distinct, icons };
      });

      const shot = path.join(ART, 'qa-categories.png');
      await page.screenshot({ path: shot });
      results.push({ page: 'qa-categories', url: '/en/qa-categories', status, categories, brokenImages: broken, screenshot: shot });
      checks.categories = { pass: categories.ok, detail: categories };
    }

    // (6) PRODUCTS LIST page (live, ice-blue blooms)
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

      const products = await page.evaluate(() => {
        const root = document.querySelector('.bg-glass-light');
        const okRoot = !!root;
        const bubbleCanvas = document.querySelectorAll('canvas').length;
        const blooms = root ? [...root.querySelectorAll('div')].filter((d) => /blur-3xl/.test(d.className)) : [];
        const blueish = blooms.map((b) => {
          const m = getComputedStyle(b).backgroundColor.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, bl] = m[1].split(',').map((x) => parseFloat(x));
          return bl > r; // ice-blue family: blue channel dominates red
        });
        const okBlooms = blueish.length > 0 && blueish.every((x) => x === true);
        return { okRoot, okBlooms, bubbleCanvas, bloomCount: blooms.length, blueish };
      });

      const shot = path.join(ART, 'products.png');
      await page.screenshot({ path: shot });
      results.push({ page: 'products-list', url: '/en/products', status, products, brokenImages: broken, screenshot: shot });
      checks.productsBlooms = { pass: products.okRoot && products.okBlooms, detail: products };
    }

    // (6b) PRODUCT CARDS — qa-products-grid harness (glass + chip + ripple)
    {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/en/qa-products-grid`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2000);
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);

      const grid = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.glass-surface')].filter((c) => c.querySelector('a[href*="products/"]'));
        const glassOk = cards.every((c) => {
          const cs = getComputedStyle(c);
          return /blur/.test(cs.backdropFilter) || /blur/.test(cs.webkitBackdropFilter || '');
        });
        const chipGrads = cards
          .map((c) => {
            const chip = [...c.querySelectorAll('span')].find((s) => /ring-white\/40/.test(s.className));
            return chip && chip.firstElementChild ? getComputedStyle(chip.firstElementChild).backgroundImage : null;
          })
          .filter(Boolean);
        const distinctChips = new Set(chipGrads).size;
        return { ok: cards.length >= 4 && glassOk && distinctChips >= 4, cardCount: cards.length, glassOk, distinctChips };
      });

      const rippleCounts = [];
      const cardLocators = page.locator('.glass-surface').filter({ has: page.locator('a[href*="products/"]') });
      const n = await cardLocators.count();
      for (let i = 0; i < n; i += 1) {
        const loc = cardLocators.nth(i);
        try {
          await loc.scrollIntoViewIfNeeded();
          await loc.hover();
          await page.waitForTimeout(500);
          const rings = await loc.locator('.water-ripple__ring').count();
          rippleCounts.push(rings);
        } catch {
          rippleCounts.push(0);
        }
      }
      const rippleOk = rippleCounts.length > 0 && rippleCounts.every((c) => c >= 1);

      const shot = path.join(ART, 'qa-products-grid.png');
      await page.screenshot({ path: shot });
      results.push({
        page: 'qa-products-grid', url: '/en/qa-products-grid', status,
        grid, rippleCounts, rippleOk, brokenImages: broken, screenshot: shot,
      });
      checks.productCards = { pass: grid.ok && rippleOk, detail: { ...grid, rippleOk, rippleCounts } };
    }

    // (7)(8)(9)(10) ABOUT (en / zh / ar)
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

      // (7) stat-section pale cyan->teal->slate gradient + OceanBubbles canvas
      const aboutStats = await page.evaluate(() => {
        const sec = [...document.querySelectorAll('section')].find(
          (s) => /(^|\s)from-cyan-50\/80(\s|$)/.test(s.className) && /(^|\s)via-teal-50\/60(\s|$)/.test(s.className) && /(^|\s)to-slate-100\/40(\s|$)/.test(s.className),
        );
        if (!sec) return { ok: false, reason: 'no stat gradient section' };
        const cs = getComputedStyle(sec);
        const bg = cs.backgroundImage;
        const hasLight = /236,\s*254,\s*255/.test(bg) || /240,\s*253,\s*250/.test(bg) || /241,\s*245,\s*249/.test(bg);
        const canvas = !!sec.querySelector('canvas');
        return { ok: hasLight && canvas, hasLight, hasCanvas: canvas };
      });
      const aboutBubbleCanvas = await page.evaluate(() => {
        const sec = [...document.querySelectorAll('section')].find((s) => /(^|\s)from-cyan-50\/80(\s|$)/.test(s.className));
        const c = sec ? sec.querySelector('canvas') : null;
        return c ? { w: c.width, h: c.height } : null;
      });

      // (8) exactly ONE "About Us" merged block
      // The merged block is marked by an eyebrow <span> whose text === about.aboutTitle.
      // Counting <span> (not body text) avoids the ar edge case where about.title ===
      // about.aboutTitle ("من نحن"), which would otherwise double-count via the <h1>.
      const aboutSingle = await page.evaluate((aboutTitle) => {
        const count = [...document.querySelectorAll('span')].filter((s) => s.textContent.trim() === aboutTitle).length;
        return { ok: count === 1, count };
      }, ABOUT_TITLE[loc]);

      // (9) card differentiation
      const aboutCards = await page.evaluate(() => {
        const ink = document.querySelectorAll('.glass-card-ink').length;
        const inkBar = document.querySelectorAll('.glass-card-ink__bar').length;
        const leftBorder = document.querySelectorAll('.glass-surface.border-s-4').length;
        const flowBar = document.querySelectorAll('.flow-bar').length;
        return { ok: ink >= 1 && inkBar >= 1 && leftBorder >= 1 && flowBar >= 1, ink, inkBar, leftBorder, flowBar };
      });

      // (10) values — no big watermark, small ordinal dot present
      const aboutValues = await page.evaluate(() => {
        const bigNum = [...document.querySelectorAll('*')].some((el) => {
          const t = (el.childNodes[0] && el.childNodes[0].nodeType === 3 ? el.textContent : '').trim();
          if (!/^(0[1-9]|1[0-2])$/.test(t)) return false;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          return fs >= 48;
        });
        const smallOrd = [...document.querySelectorAll('span')].some(
          (s) => /rounded-full/.test(s.className) && /text-xs/.test(s.className) && /^\d+$/.test(s.textContent.trim()),
        );
        return { ok: !bigNum && smallOrd, bigNum, smallOrd };
      });

      const shot = path.join(ART, `about-${loc}.png`);
      await page.screenshot({ path: shot });
      results.push({
        page: `about-${loc}`, url: `/${loc}/about`, status,
        aboutStats, aboutBubbleCanvas, aboutSingle, aboutCards, aboutValues,
        brokenImages: broken, screenshot: shot,
      });

      if (loc === 'en') {
        checks.aboutStats = { pass: aboutStats.ok, detail: aboutStats };
        checks.aboutBubbles = { pass: !!aboutBubbleCanvas && aboutBubbleCanvas.w > 0, detail: aboutBubbleCanvas };
        checks.aboutSingle = { pass: aboutSingle.ok, detail: aboutSingle };
        checks.aboutCards = { pass: aboutCards.ok, detail: aboutCards };
        checks.aboutValues = { pass: aboutValues.ok, detail: aboutValues };
      }
    }

    // PRODUCT DETAIL TABS (harness) — light glass + ice-blue blooms
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

      const detail = await page.evaluate(() => {
        const blooms = [...document.querySelectorAll('div')].filter((d) => /blur-3xl/.test(d.className));
        const blueish = blooms.map((b) => {
          const m = getComputedStyle(b).backgroundColor.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, bl] = m[1].split(',').map((x) => parseFloat(x));
          return bl > r;
        });
        const okBlooms = blueish.length > 0 && blueish.every((x) => x === true);
        return { okBlooms, bloomCount: blooms.length, blueish };
      });

      const tabs = page.locator('.glass-surface.flex.gap-1.overflow-x-auto button[aria-pressed]');
      const tabCount = await tabs.count();
      let lightGlassOk = true;
      for (let i = 0; i < tabCount; i += 1) {
        await tabs.nth(i).click();
        await page.waitForTimeout(600);
        const p = await page.evaluate(() => {
          const af = document.querySelector('.animate-fade-in');
          if (!af || !af.firstElementChild) return { found: false };
          const panel = af.firstElementChild;
          const s = getComputedStyle(panel);
          return { found: true, backdrop: s.backdropFilter || s.webkitBackdropFilter || '' };
        });
        if (!p.found) { lightGlassOk = false; continue; }
        if (!/blur/.test(p.backdrop)) lightGlassOk = false;
      }

      const shot = path.join(ART, 'qa-product-tab.png');
      await page.screenshot({ path: shot });
      results.push({
        page: 'qa-product-tab', url: '/en/qa-product-tab', status,
        detail, tabCount, tabCountOk: tabCount === 3, lightGlassOk, brokenImages: broken, screenshot: shot,
      });
      checks.productDetailGlass = { pass: detail.okBlooms && lightGlassOk, detail: { ...detail, tabCount, lightGlassOk } };
    }
  } catch (runErr) {
    console.error('RUN_ERROR', runErr);
    results.push({ page: 'RUN_ERROR', error: String((runErr && runErr.message) || runErr) });
  } finally {
    await browser.close();

    const ITEMS = [
      ['1. Starfield fade + meteor speed', checks.starfieldFade?.pass, 'bottom fade mask present; meteor speed code-verified (maxLife 120-240, speed 3.0-7.5, fadeIn 18f) + canvas animating'],
      ['2. Category theme colours', checks.categories?.pass, `distinct top-bar gradients = ${checks.categories?.detail?.distinctBars}`],
      ['3. AdvantagesSection no-float', checks.advantages?.pass, `float animation=${checks.advantages?.detail?.anyFloat}, animate-float-gentle class=${checks.advantages?.detail?.floatClass}, hover scale=${checks.advantages?.detail?.scaleHover}`],
      ['4. Partners->testimonials', checks.testimonials?.pass, `figures=${checks.testimonials?.detail?.count}, q1 present=${checks.testimonials?.detail?.hasQ1}`],
      ['5. CTA full-bleed aquarium', checks.cta?.pass, `fullBleed=${checks.cta?.detail?.fullBleed}, bubbles=${checks.cta?.detail?.bubbles}, godrays=${checks.cta?.detail?.godrays}`],
      ['6. Products ice-blue glass + chip/ripple', (checks.productsBlooms?.pass && checks.productCards?.pass), `blooms ice-blue=${checks.productsBlooms?.pass}, glass cards=${checks.productCards?.detail?.cardCount}, distinct chips=${checks.productCards?.detail?.distinctChips}, rippleOk=${checks.productCards?.detail?.rippleOk}`],
      ['7. About stats gradient + bubbles', (checks.aboutStats?.pass && checks.aboutBubbles?.pass), `gradient=${checks.aboutStats?.pass}, bubble canvas=${checks.aboutBubbles?.pass}`],
      ['8. About single "About Us"', checks.aboutSingle?.pass, `aboutUs count=${checks.aboutSingle?.detail?.count}`],
      ['9. About card differentiation', checks.aboutCards?.pass, `ink=${checks.aboutCards?.detail?.ink}, leftBorder=${checks.aboutCards?.detail?.leftBorder}, flowBar=${checks.aboutCards?.detail?.flowBar}`],
      ['10. Values no big watermark', checks.aboutValues?.pass, `bigNum=${checks.aboutValues?.detail?.bigNum}, smallOrdinal=${checks.aboutValues?.detail?.smallOrd}`],
    ];
    const failed = ITEMS.filter(([, p]) => p !== true);
    const isPass = failed.length === 0 && pageErrors.length === 0;

    const summary = {
      base: BASE,
      generatedAt: new Date().toISOString(),
      items: ITEMS.map(([name, pass, evidence]) => ({ name, pass: pass === true, evidence })),
      pageErrors,
      consoleErrors,
      brokenImages: results.flatMap((r) => r.brokenImages || []),
      isPass,
      routing: pageErrors.length > 0 ? 'Engineer' : failed.length > 0 ? 'Engineer' : 'NoOne',
    };
    fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify({ summary, results }, null, 2));
    console.log(JSON.stringify({ summary, results }, null, 2));
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
