// V45 Visual Regression — QA automated browser checks (Playwright, system Chrome).
//
// Validates the 6 V45 visual-polish fixes against the running dev server
// (http://localhost:3002). No PostgreSQL is needed: the home + about pages
// render from static/default data, and the product fixes are exercised through
// the existing QA harness routes that mount the REAL <ProductCard> /
// <ProductDetailView> components with deterministic mock data.
//
//   1. Starfield   -> bottom fade mask lengthened + softened: h-80
//                     (from-transparent via-white/25 to-white/80) instead of
//                     the old hard h-56 (...to-white). Verify height > 280px and
//                     gradient end alpha === 0.8 (soft, < 1.0).
//   2. Testimonials-> 6 figure.glass-surface cards on home (was 3); en/zh/ar all
//                     render 6 with no missing-translation keys.
//   3. StatsBand   -> 4 stat numbers in 4 DISTINCT low-saturation ice-blue
//                     colours (cyan / teal / sky / indigo); no high-sat
//                     amber/yellow or violet/purple blocks.
//   4. Products    -> Hot badge unified to rose family (featured card gradient
//                     === rose-500→pink-500); product cards have glass blur;
//                     /products + detail root use bg-glass-light-warm;
//                     detail Tab active state has cyan bottom border
//                     (border-b-2 + border-cyan-500 / text-cyan-700) and the
//                     panel is frosted (bg-slate-50/60 + backdrop-blur).
//   5. About photo -> "关于我们" image src === /images/about/company-building.webp,
//                     HTTP 200 (naturalWidth > 0, not broken), rounded-2xl
//                     shadow-lg object-cover.
//   6. About card  -> "我们的业务" left column is a brand word-card: contains
//                     "Qtech" text + blue→indigo gradient + rounded-[24px];
//                     grid uses items-stretch so word-card == text column height
//                     (diff < 10px).
//   + i18n en/zh/ar render all blocks, rtl on ar; 0 uncaught JS errors; 0 broken imgs.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3002';
const ART = path.resolve(process.cwd(), 'scripts/qa/v45-artifacts');
fs.mkdirSync(ART, { recursive: true });

const pageErrors = [];   // uncaught JS exceptions (the headline "0 JS errors" metric)
const consoleErrors = []; // console.error messages (DB-down noise expected in this env)
const results = [];
const checks = {};        // structured per-item results

// Localized copy so assertions are NOT falsely flagged on zh/ar by en-only substrings.
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

function classHas(el, cls) {
  const c = el.className || '';
  return new RegExp(`(^|\\s)${cls}(\\s|$)`).test(c);
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
    // ===================== HOME (en / zh / ar) =====================
    for (const loc of ['en', 'zh', 'ar']) {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/${loc}`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2800);
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

      // (1) Starfield bottom fade mask — lengthened (h-80) + softened (end alpha 0.8, not 1.0)
      const starfieldFade = await page.evaluate(() => {
        const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
        const sf = document.querySelector('.starfield');
        if (!sf) return { ok: false, reason: 'no .starfield' };
        const mask = [...sf.querySelectorAll('div')].find((d) => {
          const c = d.className || '';
          return ch(d, 'to-white/80') && ch(d, 'bg-gradient-to-b') && ch(d, 'bottom-0');
        });
        if (!mask) return { ok: false, reason: 'no bottom fade mask' };
        const cs = getComputedStyle(mask);
        const h = parseFloat(cs.height);
        const bg = cs.backgroundImage;
        const stops = (bg.match(/rgba?\(([^)]+)\)/g) || []).map((s) =>
          s.replace(/rgba?\(|\)/g, '').split(',').map((x) => parseFloat(x)),
        );
        const alphas = stops.map((p) => p[3]);
        const heightOk = h > 280;            // h-80 = 320px, clearly > V44's h-56=224px
        const softOk = Math.abs((alphas[alphas.length - 1] ?? 1) - 0.8) < 0.05; // end alpha 0.8 (< 1)
        const midOk = Math.abs((alphas[1] ?? 0) - 0.25) < 0.05;                  // via-white/25
        const ok = heightOk && softOk && midOk;
        return { ok, height: h, alphas, heightOk, softOk, midOk };
      });

      // (2) Testimonials — 6 cards, no missing-translation keys
      const testimonials = await page.evaluate((q1) => {
        const figs = [...document.querySelectorAll('figure.glass-surface')].filter((f) => f.querySelector('blockquote'));
        const missingTranslation = figs.some((f) => {
          const bq = f.querySelector('blockquote');
          const t = bq ? bq.textContent.trim() : '';
          return t.startsWith('home.testimonials.') || t.length === 0;
        });
        const hasQ1 = figs.some((f) => f.innerText.includes(q1));
        return { ok: figs.length === 6 && !missingTranslation && hasQ1, count: figs.length, missingTranslation, hasQ1 };
      }, TESTI_Q1[loc]);

      // (3) StatsBand — 4 numbers, 4 distinct low-sat ice-blue colours, no amber/violet
      const stats = await page.evaluate(() => {
        const nums = [...document.querySelectorAll('.stat-number-anim')];
        const colors = nums.map((n) => getComputedStyle(n).color);
        const distinct = new Set(colors);
        const parse = (c) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          return m ? m[1].split(',').map((x) => parseFloat(x)) : null;
        };
        const coolDominant = colors.map((c) => {
          const p = parse(c);
          // ice-blue family: the blue OR green channel dominates the warm (red) channel
          // (teal-600 is green-dominant, so blue>red alone is too strict).
          return p ? p[2] > p[0] || p[1] > p[0] : false;
        });
        const allIce = coolDominant.every(Boolean);
        const noHighSat = !colors.some((c) => {
          const p = parse(c);
          if (!p) return false;
          const [r, g, b] = p;
          const amber = r > 200 && g < 180 && b < 130;          // yellow/amber family
          const violet = r > 100 && b > 200 && g < 130;          // violet/purple family
          return amber || violet;
        });
        return {
          ok: nums.length === 4 && distinct.size === 4 && allIce && noHighSat,
          count: nums.length,
          distinct: distinct.size,
          colors,
        };
      });

      const shot = path.join(ART, `home-${loc}.png`);
      await page.screenshot({ path: shot, fullPage: false });

      results.push({
        page: `home-${loc}`, url: `/${loc}`, status, i18nOk, htmlLang, htmlDir,
        starfieldFade, testimonials, stats, brokenImages: broken, screenshot: shot,
      });

      if (loc === 'en') {
        checks.starfieldFade = { pass: starfieldFade.ok, detail: starfieldFade };
        checks.testimonials = { pass: testimonials.ok, detail: testimonials };
        checks.statsBand = { pass: stats.ok, detail: stats };
      }
    }

    // ===================== PRODUCTS LIST (warm bg + Hot rose badge + glass) =====================
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

      const productsList = await page.evaluate(() => {
        const warmBg = !!document.querySelector('.bg-glass-light-warm');
        return { warmBg };
      });

      const shot = path.join(ART, 'products-list.png');
      await page.screenshot({ path: shot });
      results.push({ page: 'products-list', url: '/en/products', status, productsList, brokenImages: broken, screenshot: shot });
      checks.productsWarmBg = { pass: productsList.warmBg, detail: productsList };
    }

    // (4) PRODUCT CARDS — qa-products-grid harness (real ProductCard ocean)
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
        const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
        // rose-500 = rgb(244,63,94); pink-500 = rgb(236,72,153)
        const isRose = (bg) => {
          const ms = bg.match(/rgba?\(([^)]+)\)/g) || [];
          return ms.some((s) => {
            const p = s.replace(/rgba?\(|\)/g, '').split(',').map((x) => parseFloat(x));
            return Math.abs(p[0] - 244) < 6 && Math.abs(p[1] - 63) < 6 && Math.abs(p[2] - 94) < 6;
          }) && ms.some((s) => {
            const p = s.replace(/rgba?\(|\)/g, '').split(',').map((x) => parseFloat(x));
            return Math.abs(p[0] - 236) < 6 && Math.abs(p[1] - 72) < 6 && Math.abs(p[2] - 153) < 6;
          });
        };
        const cards = [...document.querySelectorAll('.glass-surface')].filter((c) => c.querySelector('a[href*="products/"]'));
        const badges = [];
        let roseHotBadge = false;
        for (const card of cards) {
          const badge = [...card.querySelectorAll('span')].find(
            (s) => ch(s, 'bg-gradient-to-r') && ch(s, 'text-white'),
          );
          if (!badge) continue;
          const cs = getComputedStyle(badge);
          badges.push({ txt: badge.textContent.trim(), bg: cs.backgroundImage });
          if (ch(badge, 'from-rose-500') || isRose(cs.backgroundImage)) roseHotBadge = true;
        }
        const glassOk = cards.every((c) => {
          const cs = getComputedStyle(c);
          return /blur/.test(cs.backdropFilter) || /blur/.test(cs.webkitBackdropFilter || '');
        });
        return {
          ok: roseHotBadge && glassOk && cards.length >= 4,
          cardCount: cards.length,
          roseHotBadge,
          glassOk,
          badges,
        };
      });

      const shot = path.join(ART, 'qa-products-grid.png');
      await page.screenshot({ path: shot });
      results.push({ page: 'qa-products-grid', url: '/en/qa-products-grid', status, grid, brokenImages: broken, screenshot: shot });
      checks.productHotRose = { pass: grid.ok, detail: grid };
    }

    // (4b) PRODUCT DETAIL — qa-product-tab harness (real ProductDetailView)
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

      const warmBg = await page.evaluate(() => !!document.querySelector('.bg-glass-light-warm'));

      // Click through every REAL tab (scoped to the tab rail; ignore image thumbnails
      // which also carry aria-pressed). Verify active tab cyan bottom border + frosted panel.
      const tabInfo = await page.evaluate(() => {
        const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
        const rail = [...document.querySelectorAll('div')].find(
          (d) => ch(d, 'glass-surface') && ch(d, 'flex') && ch(d, 'gap-1'),
        );
        if (!rail) return { count: 0 };
        const btns = [...rail.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 0);
        return { count: btns.length, labels: btns.map((b) => b.textContent.trim()) };
      });
      const tabCount = tabInfo.count;
      let tabBorderOk = true;
      let panelOk = true;
      const tabDetails = [];
      for (let i = 0; i < tabCount; i += 1) {
        // Click by index inside the page context to avoid selecting image thumbnails.
        const clickOk = await page.evaluate((idx) => {
          const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
          const rail = [...document.querySelectorAll('div')].find(
            (d) => ch(d, 'glass-surface') && ch(d, 'flex') && ch(d, 'gap-1'),
          );
          if (!rail) return false;
          const btns = [...rail.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 0);
          if (!btns[idx]) return false;
          btns[idx].click();
          return true;
        }, i);
        await page.waitForTimeout(600);
        if (!clickOk) { tabBorderOk = false; panelOk = false; continue; }
        const r = await page.evaluate(() => {
          const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
          const rail = [...document.querySelectorAll('div')].find(
            (d) => ch(d, 'glass-surface') && ch(d, 'flex') && ch(d, 'gap-1'),
          );
          if (!rail) return { found: false };
          const active = [...rail.querySelectorAll('button')].find(
            (t) => t.getAttribute('aria-pressed') === 'true',
          );
          if (!active) return { found: false };
          const cs = getComputedStyle(active);
          const borderW = parseFloat(cs.borderBottomWidth);
          const isCyanBorder = /rgb\(6,\s*182,\s*212\)/.test(cs.borderBottomColor); // border-cyan-500
          const isCyanText = /rgb\(14,\s*116,\s*144\)/.test(cs.color);              // text-cyan-700
          const panel = [...document.querySelectorAll('div')].find((d) => ch(d, 'bg-slate-50/60'));
          if (!panel) return {
            found: true,
            borderW,
            borderColor: cs.borderBottomColor,
            color: cs.color,
            cyanBorder: isCyanBorder,
            cyanText: isCyanText,
            panelFound: false,
            panelBlur: false,
            panelBg: '',
            panelFrosted: false,
          };
          const pcs = getComputedStyle(panel);
          const pBlur = /blur/.test(pcs.backdropFilter || pcs.webkitBackdropFilter || '');
          const pFrosted = pBlur && /0\.6/.test(pcs.backgroundColor);
          return {
            found: true,
            borderW,
            borderColor: cs.borderBottomColor,
            color: cs.color,
            cyanBorder: isCyanBorder,
            cyanText: isCyanText,
            panelFound: true,
            panelBlur: pBlur,
            panelBg: pcs.backgroundColor,
            panelFrosted: pFrosted,
          };
        });
        tabDetails.push(r);
        if (!r.found) { tabBorderOk = false; panelOk = false; continue; }
        if (!(r.borderW === 2 && (r.cyanBorder || r.cyanText))) tabBorderOk = false;
        // Only fail if a frosted panel was actually expected/present for this tab.
        if (r.panelFound && !r.panelFrosted) panelOk = false;
      }

      const shot = path.join(ART, 'qa-product-tab.png');
      await page.screenshot({ path: shot });
      results.push({
        page: 'qa-product-tab', url: '/en/qa-product-tab', status,
        warmBg, tabCount, tabBorderOk, panelOk, tabDetails, brokenImages: broken, screenshot: shot,
      });
      checks.productDetailTab = { pass: warmBg && tabBorderOk && panelOk, detail: { warmBg, tabCount, tabBorderOk, panelOk } };
    }

    // ===================== ABOUT (en / zh / ar) =====================
    for (const loc of ['en', 'zh', 'ar']) {
      // dedicated listener to confirm company-building.jpg is served 200
      const companyReqs = [];
      const companyHandler = (resp) => {
        const u = resp.url();
        if (/company-building/.test(u)) companyReqs.push({ u, s: resp.status() });
      };
      page.on('response', companyHandler);

      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/${loc}/about`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2800);
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);
      page.off('response', companyHandler);

      // (5) About "关于我们" image -> /images/about/company-building.webp, 200, not broken
      const aboutPhoto = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('img')];
        const target = imgs.find((im) =>
          (im.getAttribute('src') || '').includes('company-building') ||
          (im.getAttribute('srcset') || '').includes('company-building') ||
          (im.currentSrc || '').includes('company-building'),
        );
        if (!target) return { ok: false, reason: 'no company-building img' };
        const naturalW = target.naturalWidth;
        const cs = getComputedStyle(target);
        const parentCls = target.parentElement ? target.parentElement.className : '';
        const objectCover = /object-cover/.test(target.className || '') || /object-cover/.test(cs.objectFit || '');
        const rounded = /rounded-2xl/.test(parentCls || '') || /rounded-2xl/.test(target.className || '');
        const shadowLg = /shadow-lg/.test(parentCls || '');
        return {
          ok: naturalW > 0,
          naturalWidth: naturalW,
          src: target.currentSrc || target.src,
          objectCover,
          rounded,
          shadowLg,
        };
      });
      // 200 = fresh; 304 = Not Modified (browser cache valid) — both mean the
      // image is served correctly and not broken.
      const company200 = companyReqs.length > 0 && companyReqs.every((r) => r.s === 200 || r.s === 304);

      // (6) About "我们的业务" word-card: Qtech text + gradient + rounded-[24px] + equal height
      const wordCard = await page.evaluate(() => {
        const ch = (el, cls) => new RegExp('(^|\\s)' + cls + '(\\s|$)').test((el.className) || '');
        const wc = [...document.querySelectorAll('div')].find((d) => {
          const c = d.className || '';
          // rounded-[24px] contains regex-special brackets; use a plain substring check.
          return c.includes('rounded-[24px]') && ch(d, 'bg-gradient-to-br') && ch(d, 'from-blue-100');
        });
        if (!wc) return { ok: false, reason: 'no word-card element' };
        const hasQtech = /Qtech/.test(wc.textContent || '');
        const gradientOk =
          ch(wc, 'bg-gradient-to-br') &&
          ch(wc, 'from-blue-100') &&
          ch(wc, 'via-indigo-50') &&
          ch(wc, 'to-purple-50');
        // climb to the grid that uses items-stretch
        let grid = wc.parentElement;
        while (grid && !ch(grid, 'grid')) grid = grid.parentElement;
        const gridStretch = grid ? ch(grid, 'items-stretch') : false;
        let diff = null;
        let wcColHeight = null;
        let textColHeight = null;
        if (grid) {
          const cols = [...grid.children];
          const wcCol = cols.find((c) => c.contains(wc));
          const otherCol = cols.find((c) => c !== wcCol);
          if (wcCol && otherCol) {
            wcColHeight = Math.round(wcCol.getBoundingClientRect().height);
            textColHeight = Math.round(otherCol.getBoundingClientRect().height);
            diff = Math.abs(wcColHeight - textColHeight);
          }
        }
        return {
          ok: hasQtech && gradientOk && gridStretch && diff !== null && diff < 10,
          hasQtech,
          gradientOk,
          gridStretch,
          wcHeight: Math.round(wc.getBoundingClientRect().height),
          wcColHeight,
          textColHeight,
          diff,
        };
      });

      const shot = path.join(ART, `about-${loc}.png`);
      await page.screenshot({ path: shot });
      results.push({
        page: `about-${loc}`, url: `/${loc}/about`, status,
        aboutPhoto, company200, companyReqs, wordCard, brokenImages: broken, screenshot: shot,
      });

      if (loc === 'en') {
        checks.aboutPhoto = { pass: aboutPhoto.ok && company200, detail: { ...aboutPhoto, company200 } };
        checks.aboutWordCard = { pass: wordCard.ok, detail: wordCard };
      }
    }
  } catch (runErr) {
    console.error('RUN_ERROR', runErr);
    results.push({ page: 'RUN_ERROR', error: String((runErr && runErr.message) || runErr) });
  } finally {
    await browser.close();

    const ITEMS = [
      ['1. Starfield fade lengthened + softened', checks.starfieldFade?.pass,
        `height=${checks.starfieldFade?.detail?.height}px (h-80=320), endAlpha=${checks.starfieldFade?.detail?.alphas?.[checks.starfieldFade?.detail?.alphas.length - 1]}, midAlpha(via)=${checks.starfieldFade?.detail?.alphas?.[1]}`],
      ['2. Testimonials expanded to 6', checks.testimonials?.pass,
        `count=${checks.testimonials?.detail?.count}, missingTranslation=${checks.testimonials?.detail?.missingTranslation}`],
      ['3. StatsBand 4 distinct ice-blue numbers', checks.statsBand?.pass,
        `count=${checks.statsBand?.detail?.count}, distinct=${checks.statsBand?.detail?.distinct}`],
      ['4a. Products Hot badge unified rose', checks.productHotRose?.pass,
        `cards=${checks.productHotRose?.detail?.cardCount}, roseHot=${checks.productHotRose?.detail?.roseHotBadge}, glass=${checks.productHotRose?.detail?.glassOk}`],
      ['4b. Products / detail warm bg', (checks.productsWarmBg?.pass && checks.productDetailTab?.detail?.warmBg),
        `listWarmBg=${checks.productsWarmBg?.pass}, detailWarmBg=${checks.productDetailTab?.detail?.warmBg}`],
      ['4c. Detail Tab cyan border + frosted panel', checks.productDetailTab?.pass,
        `tabCount=${checks.productDetailTab?.detail?.tabCount}, borderOk=${checks.productDetailTab?.detail?.tabBorderOk}, panelOk=${checks.productDetailTab?.detail?.panelOk}`],
      ['5. About company-building.jpg (200, not broken)', checks.aboutPhoto?.pass,
        `naturalWidth=${checks.aboutPhoto?.detail?.naturalWidth}, http200=${checks.aboutPhoto?.detail?.company200}, rounded=${checks.aboutPhoto?.detail?.rounded}, shadowLg=${checks.aboutPhoto?.detail?.shadowLg}`],
      ['6. About word-card Qtech + equal height', checks.aboutWordCard?.pass,
        `hasQtech=${checks.aboutWordCard?.detail?.hasQtech}, gradient=${checks.aboutWordCard?.detail?.gradientOk}, stretch=${checks.aboutWordCard?.detail?.gridStretch}, heightDiff=${checks.aboutWordCard?.detail?.diff}px`],
    ];
    const brokenImages = results.flatMap((r) => r.brokenImages || []);
    const failed = ITEMS.filter(([, p]) => p !== true);
    const isPass = failed.length === 0 && pageErrors.length === 0 && brokenImages.length === 0;

    const summary = {
      base: BASE,
      generatedAt: new Date().toISOString(),
      items: ITEMS.map(([name, pass, evidence]) => ({ name, pass: pass === true, evidence })),
      pageErrors,
      consoleErrors,
      brokenImages,
      isPass,
      routing: pageErrors.length > 0 || brokenImages.length > 0 || failed.length > 0 ? 'Engineer' : 'NoOne',
    };
    fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify({ summary, results }, null, 2));
    console.log(JSON.stringify({ summary, results }, null, 2));
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
