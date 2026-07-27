import { chromium } from 'playwright';

const BASE = 'http://localhost:3002';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(`${BASE}/en/qa-product-tab`, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(2500);

// Identify the tab rail (div.glass-surface.flex.gap-1) and its real text-labeled buttons.
const tabInfo = await page.evaluate(() => {
  const rail = [...document.querySelectorAll('div')].find(
    (d) => /(^|\s)glass-surface(\s|$)/.test(d.className) && /(^|\s)flex(\s|$)/.test(d.className) && /(^|\s)gap-1(\s|$)/.test(d.className),
  );
  if (!rail) return { found: false };
  const btns = [...rail.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 0);
  return { found: true, count: btns.length, labels: btns.map((b) => b.textContent.trim()) };
});
console.log('tab rail:', JSON.stringify(tabInfo));

const n = tabInfo.count || 0;
for (let i = 0; i < n; i += 1) {
  // Click the real tab button by index (in-page .click() triggers React onClick).
  await page.evaluate((idx) => {
    const rail = [...document.querySelectorAll('div')].find(
      (d) => /(^|\s)glass-surface(\s|$)/.test(d.className) && /(^|\s)flex(\s|$)/.test(d.className) && /(^|\s)gap-1(\s|$)/.test(d.className),
    );
    const btns = [...rail.querySelectorAll('button')].filter((b) => b.textContent.trim().length > 0);
    btns[idx].click();
  }, i);
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const rail = [...document.querySelectorAll('div')].find(
      (d) => /(^|\s)glass-surface(\s|$)/.test(d.className) && /(^|\s)flex(\s|$)/.test(d.className) && /(^|\s)gap-1(\s|$)/.test(d.className),
    );
    const active = [...rail.querySelectorAll('button')].find((b) => b.getAttribute('aria-pressed') === 'true');
    const btn = active
      ? {
          label: active.textContent.trim(),
          borderBottomWidth: getComputedStyle(active).borderBottomWidth,
          borderBottomColor: getComputedStyle(active).borderBottomColor,
          color: getComputedStyle(active).color,
          cls: active.className,
        }
      : null;
    const panels = [...document.querySelectorAll('div')].filter((d) => /(^|\s)bg-slate-50\/60(\s|$)/.test(d.className));
    const panelInfo = panels.map((p) => ({
      cls: p.className,
      bg: getComputedStyle(p).backgroundColor,
      backdrop: getComputedStyle(p).backdropFilter || getComputedStyle(p).webkitBackdropFilter || '',
    }));
    return { btn, panelCount: panels.length, panels: panelInfo.slice(0, 2) };
  });
  console.log(`--- real tab ${i} (${info.btn?.label}) ---`);
  console.log(JSON.stringify(info, null, 2));
}
await browser.close();
