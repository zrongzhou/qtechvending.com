import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
const p = await b.newContext({ viewport: { width: 1366, height: 900 } }).then((c) => c.newPage());
await p.goto('http://localhost:3002/en/products', { waitUntil: 'load', timeout: 90000 });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const root = document.querySelector('.bg-glass-light');
  const blooms = [...root.querySelectorAll('div')].filter((d) => /blur-3xl/.test(d.className));
  return blooms.map((d) => ({ cls: d.className, bg: getComputedStyle(d).backgroundColor }));
});
console.log(JSON.stringify(r, null, 2));
await b.close();
