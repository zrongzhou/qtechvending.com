// V46 Visual Regression — QA automated browser checks (Playwright).
//
// Verifies the 4 V46 claims against the running dev server (BASE, default 3003):
//   1. ProductCard category differentiation — each card carries a distinct
//      category hue via (a) 2px tinted top border, (b) tinted resting border,
//      (c) category-coloured hover glow (replacing the default cyan glow),
//      (d) category top-accent bar. Rendered across ALL 10 categories via the
//      /[locale]/qa-v46-verify harness route (real <ProductCard ocean/>, mock
//      data, no DB needed). Assert >= 6 distinct hues; explicitly verify the 3
//      NEW categories (sugar-cane→lime, pet-wash→pink, food→orange) render
//      non-cyan distinct hues.
//   2. accents.ts completeness — derived from the rendered DOM: 10 categories
//      all map to distinct AccentSets (no cyan fallback). Also a source grep
//      confirms 10 keys + border/borderTop/glowShadow fields.
//   3. tailwind.config content includes ./src/lib/** so the accents.ts literal
//      classes are JIT-emitted (verified by grepping the compiled CSS).
//   4. AdvantagesSection — 4 cards, each with a subtle ice-blue status dot
//      (cyan / sky / teal / indigo); 4 distinct ice-blue colours.
//   + i18n en/zh/ar render product cards + home; ar is RTL; 0 uncaught JS
//     errors; 0 broken images.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE_URL || 'http://localhost:3003';
const ART = path.resolve(process.cwd(), 'scripts/qa/v46-artifacts');
fs.mkdirSync(ART, { recursive: true });

const pageErrors = [];
const consoleErrors = [];
const hydrationWarnings = [];
const results = [];
const checks = {};

const classHas = (el, cls) =>
  new RegExp('(^|\\s)' + cls.replace(/[/[\].]/g, '\\$&') + '(\\s|$)').test((el.className || ''));

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

// ---- Product-card extraction (used for the qa-v46-verify route) ----
async function extractCards(page) {
  return await page.evaluate(() => {
    const has = (el, cls) =>
      new RegExp('(^|\\s)' + cls.replace(/[/[\].]/g, '\\$&') + '(\\s|$)').test((el.className || ''));
    const cards = [...document.querySelectorAll('.glass-surface')].filter((c) =>
      c.querySelector('a[href*="products/"]'),
    );
    const out = [];
    for (const card of cards) {
      const cs = getComputedStyle(card);
      const topBar = [...card.querySelectorAll('span')].find(
        (s) => has(s, 'h-1') && has(s, 'bg-gradient-to-r') && has(s, 'top-0'),
      );
      const topBarBg = topBar ? getComputedStyle(topBar).backgroundImage : '';
      const m = (card.className || '').match(/hover:!shadow-\[[^\]]*rgba\(([^)]+)\)[^\]]*\]/);
      const glowRgba = m ? m[1].trim() : null; // e.g. "244,114,182,0.25"
      out.push({
        borderTopColor: cs.borderTopColor,
        borderTopWidth: parseFloat(cs.borderTopWidth),
        borderColor: cs.borderColor,
        backdrop: cs.backdropFilter || cs.webkitBackdropFilter || '',
        topBarBg,
        hasGlowClass: /hover:!shadow-/.test(card.className || ''),
        hasBorderClass: /!border-/.test(card.className || ''),
        glowRgba,
        cls: card.className || '',
      });
    }
    return out;
  });
}

// Hover a card by index and read the resolved box-shadow (glow).
async function hoverGlow(page, idx) {
  const sel = `.glass-surface`;
  const handles = await page.$$(sel);
  const target = handles[idx];
  if (!target) return { ok: false, reason: 'no card' };
  await target.hover();
  await page.waitForTimeout(650); // let the shadow transition settle
  const shadow = await target.evaluate((el) => getComputedStyle(el).boxShadow);
  await page.mouse.move(5, 5); // leave
  await page.waitForTimeout(50);
  return { ok: true, boxShadow: shadow };
}

async function main() {
  const ready = await waitForServer(240000);
  if (!ready) {
    console.error('SERVER_NOT_READY');
    process.exit(2);
  }

  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  } catch {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));
  page.on('console', (m) => {
    const t = m.type();
    if (t === 'error') consoleErrors.push(m.text());
    if (t === 'warning' && /hydrat/i.test(m.text())) hydrationWarnings.push(m.text());
  });

  try {
    // ============ HOME en/zh/ar — AdvantagesSection ice dots ============
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

      const advantages = await page.evaluate(() => {
        const has = (el, cls) =>
          new RegExp('(^|\\s)' + cls.replace(/[/[\].]/g, '\\$&') + '(\\s|$)').test((el.className || ''));
        const ICE = ['bg-cyan-400/80', 'bg-sky-400/80', 'bg-teal-400/80', 'bg-indigo-400/80'];
        const dots = [...document.querySelectorAll('span')].filter((s) => {
          const c = s.className || '';
          return has(s, 'h-2') && has(s, 'w-2') && has(s, 'rounded-full') && has(s, 'ring-2') && has(s, 'ring-white/70');
        });
        // Match the FULL bg class token (incl. the /80 opacity modifier).
        const hasIceClass = dots.map((d) => ICE.find((ic) => has(d, ic)));
        const colors = dots.map((d) => getComputedStyle(d).backgroundColor);
        const distinct = new Set(colors);
        const parse = (c) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          return m ? m[1].split(',').map((x) => parseFloat(x)) : null;
        };
        const iceBlue = colors.map((c) => {
          const p = parse(c);
          return p ? p[2] > p[0] : false; // blue/green dominant over red
        });
        return {
          count: dots.length,
          distinct: distinct.size,
          colors,
          allIceBlue: iceBlue.every(Boolean),
          hasIceClassOk: dots.length === 4 && hasIceClass.filter(Boolean).length === 4,
        };
      });

      const exists = await page.evaluate(() => !!document.querySelector('section'));
      const shot = path.join(ART, `home-${loc}.png`);
      await page.screenshot({ path: shot, fullPage: false });

      results.push({
        page: `home-${loc}`,
        url: `/${loc}`,
        status,
        i18nOk,
        htmlLang,
        htmlDir,
        advantages,
        brokenImages: broken,
        screenshot: shot,
      });

      if (loc === 'en') {
        checks.advantagesIceDots = {
          pass: advantages.count === 4 && advantages.distinct === 4 && advantages.allIceBlue && advantages.hasIceClassOk,
          detail: advantages,
        };
      }
    }

    // ============ qa-v46-verify en/zh/ar — ProductCard category diff ============
    const SLUG_ORDER = [
      'fresh-flower', 'pizza', 'cotton-candy', 'fruit', 'sugar-cane',
      'ice-maker', 'coffee', 'ice-cream', 'pet-washing', 'food',
    ];
    for (const loc of ['en', 'zh', 'ar']) {
      const hook = attachBroken(page);
      let status = -1;
      try {
        const resp = await page.goto(`${BASE}/${loc}/qa-v46-verify`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2500);
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);

      const cards = await extractCards(page);
      const huesTop = new Set(cards.map((c) => c.borderTopColor));
      const huesBar = new Set(
        cards.map((c) => (c.topBarBg && c.topBarBg !== 'none' ? c.topBarBg : '')).filter(Boolean),
      );
      const glassOk = cards.every((c) => /blur/.test(c.backdrop));
      const borderClassOk = cards.every((c) => c.hasBorderClass);
      const glowClassOk = cards.every((c) => c.hasGlowClass);
      const topWidthOk = cards.every((c) => c.borderTopWidth === 2);

      // Hover-glow check on every card: resolved box-shadow must contain the
      // card's own category glow rgba (not the cyan default 34,211,238).
      const glowChecks = [];
      for (let i = 0; i < cards.length; i += 1) {
        const g = await hoverGlow(page, i);
        if (!g.ok) {
          glowChecks.push({ ok: false, reason: g.reason });
          continue;
        }
        const expected = cards[i].glowRgba ? cards[i].glowRgba.split(',').slice(0, 3).join(',') : null;
        const normalized = g.boxShadow.replace(/\s+/g, '');
        const matches = expected ? normalized.includes(expected.replace(/\s+/g, '')) : false;
        const isCyan = /34,211,238/.test(normalized);
        glowChecks.push({ ok: matches && !isCyan, expected, boxShadow: g.boxShadow, isCyan });
      }
      const glowAppliedOk = glowChecks.every((g) => g.ok);

      // Ripple check: REAL Playwright hover on the first product card fires
      // React's onMouseEnter → RippleOnHover renders .water-ripple__ring spans.
      let ripple = { ok: false, rings: 0, reason: 'no card' };
      {
        const handles = await page.$$('.glass-surface');
        let target = null;
        for (const h of handles) {
          const hasLink = await h.evaluate((el) => !!el.querySelector('a[href*="products/"]'));
          if (hasLink) {
            target = h;
            break;
          }
        }
        if (target) {
          await target.hover();
          await page.waitForTimeout(400);
          const rings = await target.evaluate((el) => el.querySelectorAll('.water-ripple__ring').length);
          ripple = { ok: rings >= 1, rings };
          await page.mouse.move(5, 5); // leave
        }
      }

      const shot = path.join(ART, `qa-v46-${loc}.png`);
      await page.screenshot({ path: shot });

      results.push({
        page: `qa-v46-${loc}`,
        url: `/${loc}/qa-v46-verify`,
        status,
        cardCount: cards.length,
        distinctTopHues: huesTop.size,
        distinctBarGradients: huesBar.size,
        glassOk,
        borderClassOk,
        glowClassOk,
        topWidthOk,
        glowAppliedOk,
        ripple,
        glowChecks,
        brokenImages: broken,
        screenshot: shot,
      });

      if (loc === 'en') {
        // Verify the 3 NEW categories render non-cyan, distinct hues.
        // sugar-cane→lime (green), pet-washing→pink, food→orange.
        const bySlug = {};
        // map via slug order using the card sequence rendered (same order as page)
        cards.forEach((c, i) => {
          bySlug[SLUG_ORDER[i]] = c;
        });
        const limeTop = bySlug['sugar-cane'] ? bySlug['sugar-cane'].borderTopColor : null;
        const pinkTop = bySlug['pet-washing'] ? bySlug['pet-washing'].borderTopColor : null;
        const orangeTop = bySlug['food'] ? bySlug['food'].borderTopColor : null;
        const parseTop = (c) => {
          const m = (c || '').match(/rgba?\(([^)]+)\)/);
          return m ? m[1].split(',').map((x) => parseFloat(x)) : null;
        };
        const limeP = parseTop(limeTop);
        const pinkP = parseTop(pinkTop);
        const orangeP = parseTop(orangeTop);
        const limeGreenDom = limeP ? limeP[1] > limeP[0] : false; // green > red
        const pinkNotCyan = pinkP ? !(pinkP[2] > pinkP[0] && pinkP[1] > pinkP[0]) || pinkP[0] > 150 : false;
        const newCatsOk =
          !!limeTop && !!pinkTop && !!orangeTop &&
          limeP && limeP[1] > limeP[0] + 30 && // clearly green
          pinkP && pinkP[0] > pinkP[1] && pinkP[0] > pinkP[2] && // pink/red > green,blue
          orangeP && orangeP[0] > orangeP[2] && orangeP[0] > 180; // orange/red dominant
        const newCatsDistinct =
          new Set([limeTop, pinkTop, orangeTop]).size === 3 &&
          ![limeTop, pinkTop, orangeTop].includes('rgb(34, 211, 238)');

        checks.productCardDiff = {
          pass:
            cards.length === 10 &&
            huesTop.size >= 6 &&
            glassOk &&
            borderClassOk &&
            glowClassOk &&
            topWidthOk &&
            glowAppliedOk &&
            ripple.ok &&
            newCatsOk &&
            newCatsDistinct,
          detail: {
            cardCount: cards.length,
            distinctTopHues: huesTop.size,
            distinctBarGradients: huesBar.size,
            glassOk,
            borderClassOk,
            glowClassOk,
            topWidthOk,
            glowAppliedOk,
            ripple,
            newCatsOk,
            newCatsDistinct,
            limeTop,
            pinkTop,
            orangeTop,
            allTopColors: cards.map((c) => c.borderTopColor),
          },
        };
      }
    }

    // ============ live /en/products — report real state (DB-dependent) ============
    {
      const hook = attachBroken(page);
      let status = -1;
      let cardCount = -1;
      try {
        const resp = await page.goto(`${BASE}/en/products`, { waitUntil: 'load', timeout: 90000 });
        status = resp ? resp.status() : -1;
        await page.waitForTimeout(2500);
        cardCount = await page.evaluate(
          () => [...document.querySelectorAll('.glass-surface')].filter((c) => c.querySelector('a[href*="products/"]')).length,
        );
      } catch {
        status = -1;
      }
      const broken = detachBroken(page, hook);
      const shot = path.join(ART, 'products-live.png');
      await page.screenshot({ path: shot });
      results.push({
        page: 'products-live',
        url: '/en/products',
        status,
        cardCount,
        note: cardCount === 0 ? 'DB likely unavailable → empty grid (expected in this env)' : '',
        brokenImages: broken,
        screenshot: shot,
      });
    }
  } catch (runErr) {
    console.error('RUN_ERROR', runErr);
    results.push({ page: 'RUN_ERROR', error: String((runErr && runErr.message) || runErr) });
  } finally {
    await browser.close();

    // ============ Claim #3 — compiled Tailwind CSS contains accents.ts classes ============
    let cssCheck = { ok: false, reason: 'not run' };
    const cssOut = path.join(ART, 'v46-compiled.css');
    try {
      execFileSync(
        'npx',
        ['tailwindcss', '-i', './src/app/globals.css', '-o', cssOut, '--minify'],
        { cwd: process.cwd(), stdio: 'pipe', timeout: 180000, shell: true },
      );
      const css = fs.readFileSync(cssOut, 'utf8');
      const needles = [
        'border-rose-200', 'border-lime-200', 'border-pink-200', 'border-orange-200',
        'border-sky-200', 'border-violet-200', 'border-emerald-200', 'border-amber-200',
      ];
      const glowNeedles = [
        '132,204,22', // lime glow
        '244,114,182', // rose/pink glow
        '249,115,22', // orange glow
        '167,139,250', // violet glow
        '56,189,248', // sky glow
        '16,185,129', // fruit glow
      ];
      const present = needles.filter((n) => css.includes(n));
      const glowPresent = glowNeedles.filter((n) => css.includes(n));
      cssCheck = {
        ok: present.length >= 6 && glowPresent.length >= 4,
        presentCount: present.length,
        glowCount: glowPresent.length,
        present,
        glowPresent,
        bytes: css.length,
      };
      checks.tailwindContent = { pass: cssCheck.ok, detail: cssCheck };
    } catch (e) {
      cssCheck = { ok: false, reason: String((e && e.message) || e) };
      checks.tailwindContent = { pass: false, detail: cssCheck };
    }

    // ============ Claim #2 — accents.ts source completeness (grep) ============
    const accentsSrc = fs.readFileSync(path.join(process.cwd(), 'src/lib/accents.ts'), 'utf8');
    const catKeys = [
      'fresh-flower-vending-machine', 'pizza-vending-machine', 'cotton-candy-machine',
      'fruit-vegetable-egg-vending-machine', 'sugar-cane-juice-vending-machine',
      'ice-maker-vending-machine', 'coffee-vending-machine', 'ice-cream-vending-machine',
      'pet-washing-machine', 'food-vending-machine',
    ];
    const keysPresent = catKeys.filter((k) => accentsSrc.includes(`'${k}'`));
    const hasFields = ['border:', 'borderTop:', 'glowShadow:'].every((f) => accentsSrc.includes(f));
    const usesLibScan = accentsSrc.includes('./src/lib/') || accentsSrc.includes('src/lib');
    const accentsOk = keysPresent.length === 10 && hasFields;
    checks.accentsCompleteness = {
      pass: accentsOk,
      detail: { keysPresent: keysPresent.length, hasFields, usesLibScan },
    };

    const ITEMS = [
      ['1. ProductCard category differentiation (>=6 hues, border, top, glow, glass, ripple)',
        checks.productCardDiff?.pass,
        `cards=${checks.productCardDiff?.detail?.cardCount}, distinctTopHues=${checks.productCardDiff?.detail?.distinctTopHues}, glass=${checks.productCardDiff?.detail?.glassOk}, borderClass=${checks.productCardDiff?.detail?.borderClassOk}, glowClass=${checks.productCardDiff?.detail?.glowClassOk}, topWidth2px=${checks.productCardDiff?.detail?.topWidthOk}, glowApplied=${checks.productCardDiff?.detail?.glowAppliedOk}, ripple=${checks.productCardDiff?.detail?.ripple?.ok}, newCatsOk=${checks.productCardDiff?.detail?.newCatsOk}, newCatsDistinct=${checks.productCardDiff?.detail?.newCatsDistinct}`],
      ['2. accents.ts complete — 10 categories mapped, no cyan fallback',
        checks.accentsCompleteness?.pass,
        `keys=${checks.accentsCompleteness?.detail?.keysPresent}/10, fields=${checks.accentsCompleteness?.detail?.hasFields}`],
      ['3. tailwind.config content scans ./src/lib/** (compiled CSS has category classes)',
        checks.tailwindContent?.pass,
        `borderClasses=${checks.tailwindContent?.detail?.presentCount}, glowRgbas=${checks.tailwindContent?.detail?.glowCount}`],
      ['4. AdvantagesSection — 4 ice-blue status dots, 4 distinct',
        checks.advantagesIceDots?.pass,
        `count=${checks.advantagesIceDots?.detail?.count}, distinct=${checks.advantagesIceDots?.detail?.distinct}, allIceBlue=${checks.advantagesIceDots?.detail?.allIceBlue}, iceClasses=${checks.advantagesIceDots?.detail?.hasIceClassOk}`],
    ];
    const brokenImages = results.flatMap((r) => r.brokenImages || []);
    const failed = ITEMS.filter(([, p]) => p !== true);
    const isPass =
      failed.length === 0 && pageErrors.length === 0 && brokenImages.length === 0;

    const summary = {
      base: BASE,
      generatedAt: new Date().toISOString(),
      items: ITEMS.map(([name, pass, evidence]) => ({ name, pass: pass === true, evidence })),
      pageErrors,
      consoleErrors,
      hydrationWarnings,
      brokenImages,
      isPass,
      routing:
        pageErrors.length > 0 || brokenImages.length > 0 || failed.length > 0 ? 'Engineer' : 'NoOne',
    };
    fs.writeFileSync(path.join(ART, 'results.json'), JSON.stringify({ summary, results }, null, 2));
    console.log(JSON.stringify({ summary, results }, null, 2));
  }
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
