// V42 Visual Regression — QA automated browser checks (Playwright).
//
// Validates the 8 V42 visual fixes + 1 new feature:
//   1. CTA aquarium animation now visible (bubbles/plankton opacity + glow)
//   2. Cases background brightened to deep-sea blue-grey gradient + nebula
//   3. Products page brightened one step (slate-800/cyan-900/teal-900, white/14→/20 cards)
//   4. Product-detail Tabs: no white-screen (dark glass bg-slate-800/70), Features has no .pro-card
//   5. Product image Lightbox (click-to-zoom, Esc/←/→, fade+scale)
//   6. Navbar fixed white bg + Logo twin-star (double <path> sparkle, no <text> "Q")
//   7. About background non-pure-black gradient + CiPaiFrame removed from Hero
//   8. (tab/white-screen handled in #4)
//
// Plus: HTTP 200 on all routes, i18n (en/zh/ar) SSR/lang/dir, broken-image
// (404) sweep, Starfield animation running, and median-luminance brightness.
//
// NOTE: No PostgreSQL in this QA env. The data layer degrades gracefully to
// empty data, so content pages still render HTTP 200. The live
// /en/products/<slug> route calls notFound() (empty DB) — so Tab + Lightbox are
// exercised through the REAL-component QA harness routes:
//   /en/qa-product-tab  (mounts REAL <ProductDetailView> with a mock product)
//   /en/qa-products     (mounts REAL Products-page theme + REAL <ProductCard ocean>)
// These harnesses are TEST-ONLY pages (src/app/[locale]/qa-*) and mirror the
// V41 qa-product-tab pattern.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const ART = path.resolve(process.cwd(), 'scripts/qa/v42-artifacts');
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
  // ═══════════════════ HOME (en / zh / ar) ═══════════════════
  for (const loc of ['en', 'zh', 'ar']) {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/${loc}`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2800);
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

    // (b) CTA aquarium visibility
    const cta = await page.evaluate(() => {
      const sec = document.querySelector('.cta-aqua');
      if (!sec) return { ok: false, reason: 'no .cta-aqua', bubbleCount: 0, planktonCount: 0 };
      const bubbles = [...document.querySelectorAll('.cta-bubble')];
      const planktons = [...document.querySelectorAll('.cta-plankton')];
      const info = (els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return { opacity: parseFloat(s.opacity), boxShadow: s.boxShadow };
        });
      const maxOp = (arr) => (arr.length ? Math.max(...arr.map((x) => x.opacity)) : 0);
      const glow = (arr) => arr.some((x) => x.boxShadow && x.boxShadow !== 'none');
      return {
        ok: true,
        bubbleCount: bubbles.length,
        planktonCount: planktons.length,
        bubbles: info(bubbles),
        planktons: info(planktons),
        maxBubbleOpacity: maxOp(info(bubbles)),
        maxPlanktonOpacity: maxOp(info(planktons)),
        bubbleGlow: glow(info(bubbles)),
        planktonGlow: glow(info(planktons)),
      };
    });

    // (d) Cases background = gradient (not pure black)
    const cases = await page.evaluate(() => {
      const sec = Array.from(document.querySelectorAll('section')).find(
        (s) => s.className.includes('to-cyan-950'),
      );
      if (!sec) return { ok: false, reason: 'no Cases section' };
      const cs = getComputedStyle(sec);
      const cls = sec.className;
      const hasGradient = /gradient/.test(cs.backgroundImage);
      const notPureBlack = !cls.includes('#0a0e1a') || hasGradient; // gradient wins
      return {
        ok: hasGradient && notPureBlack,
        backgroundImage: cs.backgroundImage.slice(0, 120),
        classNameHasPureBlack: cls.includes('#0a0e1a'),
      };
    });

    // (c) Navbar white bg + Logo twin-star (2 <path>, no <text>)
    const navbar = await page.evaluate(() => {
      const header = document.querySelector('header');
      const headerBg = header ? getComputedStyle(header).backgroundColor : 'none';
      const svgs = [...document.querySelectorAll('header svg')];
      const logo = svgs.find((s) => s.querySelectorAll('path').length === 2);
      return {
        headerBg,
        whiteBg: headerBg === 'rgb(255, 255, 255)',
        logoFound: !!logo,
        logoPaths: logo ? logo.querySelectorAll('path').length : 0,
        logoHasText: logo ? !!logo.querySelector('text') : false,
      };
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
      ctaAqua: cta,
      ctaVisible:
        cta.bubbleCount > 0 &&
        cta.planktonCount > 0 &&
        cta.maxBubbleOpacity > 0.4 &&
        cta.maxPlanktonOpacity > 0.4 &&
        cta.bubbleGlow,
      casesBackground: cases,
      navbar,
      navbarWhiteAndLogoOk: navbar.whiteBg && navbar.logoFound && navbar.logoPaths === 2 && !navbar.logoHasText,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ═══════════════════ PRODUCTS LIST (live) ═══════════════════
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
      const root = document.querySelector('main > div') || document.querySelector('main');
      if (!root) return { ok: false, reason: 'no root' };
      const cs = getComputedStyle(root);
      const hasGradient = /gradient/.test(cs.backgroundImage);
      // slate-800 = rgb(30, 41, 59) — brighter than V41's slate-900 rgb(15,23,42)
      const hasSlate800 = /30,\s*41,\s*59/.test(cs.backgroundImage);
      return { ok: hasGradient && hasSlate800, backgroundImage: cs.backgroundImage.slice(0, 140), hasSlate800 };
    });

    const shot = path.join(ART, 'products.png');
    await page.screenshot({ path: shot });
    results.push({
      page: 'products-list',
      url: '/en/products',
      status,
      productsBackground: productsBg,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ═══════════════════ PRODUCTS BRIGHTNESS (harness w/ real cards) ═══════════════════
  {
    const hook = attachBroken(page);
    let status = -1;
    try {
      const resp = await page.goto(`${BASE}/en/qa-products`, { waitUntil: 'load', timeout: 90000 });
      status = resp ? resp.status() : -1;
      await page.waitForTimeout(2200);
    } catch {
      status = -1;
    }
    const broken = detachBroken(page, hook);

    const cardSurfaces = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('a[href*="/products/"]')];
      const surfaces = cards.map((c) => {
        // find the OceanGlassCard surface (the element with bg-white/...)
        const el = c.closest('[class*="bg-white"]') || c;
        const s = getComputedStyle(el);
        return { className: el.className.toString().slice(0, 60), backgroundColor: s.backgroundColor };
      });
      const hasWhite14 = cards.some(
        (c) => (c.closest('[class*="bg-white/14"]') || c.querySelector('[class*="bg-white/14"]')) !== null,
      );
      return { cardCount: cards.length, hasWhite14, sample: surfaces.slice(0, 3) };
    });

    const shot = path.join(ART, 'qa-products.png');
    await page.screenshot({ path: shot });
    const lum = medianLum(shot);
    results.push({
      page: 'qa-products-brightness',
      url: '/en/qa-products',
      status,
      medianLum: lum,
      brighterThanV41: lum > 51,
      target70Met: lum > 70,
      cardSurfaces,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ═══════════════════ PRODUCT DETAIL — TAB + LIGHTBOX (harness) ═══════════════════
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

    // (f) Tabs — click Features / Specs / Description, assert no white panel
    const readPanel = () =>
      page.evaluate(() => {
        const panel = document.querySelector('.animate-fade-in [class*="bg-slate-800"]');
        if (!panel) return { found: false };
        const s = getComputedStyle(panel);
        const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
        let sum = -1;
        if (m) {
          const parts = m[1].split(',').map((x) => parseFloat(x));
          sum = parts[0] + parts[1] + parts[2];
        }
        return { found: true, backgroundColor: s.backgroundColor, rgbSum: sum };
      });

    // NOTE: the thumbnail buttons in the gallery ALSO carry `aria-pressed`
    // (see ProductDetailView.tsx line ~278), so a bare `button[aria-pressed]`
    // selector would match both the tab bar AND the thumbnails — and clicking a
    // thumbnail opens the Lightbox, which then intercepts the next tab click.
    // Scope the selector to the tab bar container (`.glass-card-dark`) so we
    // only ever interact with the real Tab buttons.
    const tabs = page.locator('.glass-card-dark button[aria-pressed]');
    const tabCount = await tabs.count();
    const panelColors = [];
    let noWhiteScreen = true;
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      const p = await readPanel();
      panelColors.push(p);
      if (!p.found || p.rgbSum < 0 || p.rgbSum > 700) noWhiteScreen = false;
    }

    // Features tab must not contain a white .pro-card
    const proCardCount = await page.evaluate(() => document.querySelectorAll('.pro-card').length);
    const featuresNoProCard = proCardCount === 0;

    // (g) Lightbox — wrapped so a Lightbox hiccup never blocks the Tab result
    // or the rest of the run. Any error is captured in lightbox.error.
    const lightbox = {
      openOk: false,
      hasImg: false,
      escCloses: false,
      arrowChangesImg: false,
      arrowLeftReturns: false,
      initialSrc: '',
      afterRightSrc: '',
      afterLeftSrc: '',
      error: null,
    };
    try {
      const zoomTrigger = page.locator('.cursor-zoom-in').first();
      if (await zoomTrigger.count()) {
        await zoomTrigger.click();
        await page.waitForTimeout(600);
        lightbox.openOk = (await page.locator('.fixed.inset-0.z-\\[70\\]').count()) > 0;
        const img = page.locator('.fixed.inset-0.z-\\[70\\] img').first();
        lightbox.hasImg = (await img.count()) > 0;
        if (lightbox.hasImg) lightbox.initialSrc = (await img.getAttribute('src')) || '';
        // Esc closes
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        lightbox.escCloses = (await page.locator('.fixed.inset-0.z-\\[70\\]').count()) === 0;
        // reopen + ArrowRight changes image, then ArrowLeft steps back
        if (await zoomTrigger.count()) {
          await zoomTrigger.click();
          await page.waitForTimeout(500);
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(500);
          const img2 = page.locator('.fixed.inset-0.z-\\[70\\] img').first();
          if (await img2.count()) lightbox.afterRightSrc = (await img2.getAttribute('src')) || '';
          lightbox.arrowChangesImg =
            !!lightbox.afterRightSrc && !!lightbox.initialSrc && lightbox.afterRightSrc !== lightbox.initialSrc;
          // ArrowLeft must step back to the initial image (proves both ←/→ handlers).
          await page.keyboard.press('ArrowLeft');
          await page.waitForTimeout(500);
          const img3 = page.locator('.fixed.inset-0.z-\\[70\\] img').first();
          if (await img3.count()) lightbox.afterLeftSrc = (await img3.getAttribute('src')) || '';
          lightbox.arrowLeftReturns =
            !!lightbox.afterLeftSrc && !!lightbox.initialSrc && lightbox.afterLeftSrc === lightbox.initialSrc;
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
        }
      }
    } catch (e) {
      lightbox.error = String((e && e.message) || e);
    }

    const shot = path.join(ART, 'qa-product-tab.png');
    await page.screenshot({ path: shot });
    results.push({
      page: 'qa-product-tab',
      url: '/en/qa-product-tab',
      status,
      tabCount,
      tabCountOk: tabCount === 3,
      panelColors,
      noWhiteScreen,
      featuresNoProCard,
      proCardCount,
      lightbox,
      lightboxOk: lightbox.openOk && lightbox.hasImg && lightbox.escCloses && lightbox.arrowChangesImg,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  // ═══════════════════ ABOUT (en / zh / ar) ═══════════════════
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

    // (h) Hero bg = gradient (contains #0f172a / rgb(15,23,42)), not pure black;
    //     Hero has NO CiPaiFrame floating plaque (removed in V42).
    //
    //     IMPORTANT (test-correctness note): the company name "秋彦 / Qtech"
    //     legitimately appears in the hero subtitle as translated copy, so we
    //     must detect the CiPaiFrame *component*, NOT the word "秋彦". The
    //     CiPaiFrame plaque <div> has a unique class combo (see CiPaiFrame.tsx):
    //       border-amber-400/40 + from-slate-800/70 + to-slate-900/80 + ring-amber-400/20
    //     This combo appears ONLY in CiPaiFrame, so its absence proves removal.
    const about = await page.evaluate(() => {
      const main = document.querySelector('main');
      const hero = main ? main.querySelector('section') : null;
      if (!hero) return { ok: false, reason: 'no hero section' };
      const cs = getComputedStyle(hero);
      const img = cs.backgroundImage;
      const hasGradient = /gradient/.test(img);
      const has015_23_42 = /15,\s*23,\s*42/.test(img) || img.includes('#0f172a');
      const nonPureBlack = hasGradient && has015_23_42;
      const isCiPaiPlaque = (el) => {
        const c = (el.className || '').toString();
        return (
          c.includes('border-amber-400/40') &&
          c.includes('from-slate-800/70') &&
          c.includes('to-slate-900/80') &&
          c.includes('ring-amber-400/20')
        );
      };
      const heroHasCiPai = [...hero.querySelectorAll('div')].some(isCiPaiPlaque);
      const heroText = hero.innerText || '';
      const heroHasQiuyan = heroText.includes('秋彦'); // informational only (legit brand name)
      return {
        ok: nonPureBlack && !heroHasCiPai,
        backgroundImage: img.slice(0, 120),
        hasGradient,
        has015_23_42,
        heroHasCiPai,
        heroHasQiuyan,
      };
    });

    const shot = path.join(ART, `about-${loc}.png`);
    await page.screenshot({ path: shot });
    results.push({
      page: `about-${loc}`,
      url: `/${loc}/about`,
      status,
      aboutHero: about,
      aboutHeroOk: about.ok,
      brokenImages: broken,
      screenshot: shot,
    });
  }

  } catch (runErr) {
    console.error('RUN_ERROR', runErr);
    // Record the failure as a synthetic result so it is visible in the report.
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
