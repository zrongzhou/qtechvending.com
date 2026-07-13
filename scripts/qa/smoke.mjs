// QA: Route smoke test for the QtechVending trilingual site.
// Fetches each route and asserts HTTP 200 + key markers.
// NOTE: data-driven pages are expected to DEGRADE GRACEFULLY (render shell with
// empty sections) when the database is unavailable. A 500 from an empty/missing
// DB is treated as a SOURCE BUG (not an environment artifact).
import http from 'node:http';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Pick a real slug from the crawler data so detail routes are valid.
import fs from 'node:fs';
import path from 'node:path';
const DATA = path.resolve('scripts/data');
let productSlug = '';
let categorySlug = '';
try {
  productSlug = JSON.parse(fs.readFileSync(path.join(DATA, 'products.json'), 'utf8'))[0]?.slug || '';
  categorySlug = JSON.parse(fs.readFileSync(path.join(DATA, 'categories.json'), 'utf8'))[0]?.slug || '';
} catch { /* ignore */ }

const ROUTES = [
  { path: '/en', markers: ['Qtech', 'Products', 'Blog', 'About', 'Contact', 'lang="en"'] },
  { path: '/zh', markers: ['Qtech', 'lang="zh"'] },
  { path: '/ar', markers: ['Qtech', 'lang="ar"', 'dir="rtl"'] },
  { path: '/en/products', markers: ['Products', 'Qtech'] },
  { path: `/en/products/${productSlug}`, markers: ['Qtech'] },
  { path: `/en/category/${categorySlug}`, markers: ['Qtech'] },
  { path: '/en/blog', markers: ['Blog', 'Qtech'] },
  { path: '/en/about', markers: ['About', 'Qtech'] },
  { path: '/en/contact', markers: ['name', 'email', 'phone', 'company', 'country', 'productInterest', 'subject', 'message'] },
  { path: '/xiaozhouBackend/login', markers: ['Qtech', 'login', 'Login'] },
];

function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 0, body: String(e) }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
  });
}

const results = [];
for (const r of ROUTES) {
  const url = `${BASE}${r.path}`;
  const { status, body } = await get(url);
  const missing = r.markers.filter((m) => !body.includes(m));
  const ok = status === 200 && missing.length === 0;
  results.push({ path: r.path, status, missing, ok });
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${status}  ${r.path}` +
      (missing.length ? `  missing=[${missing.join(', ')}]` : '')
  );
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} routes passed`);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.log('Failing routes:');
  for (const f of failed) console.log(`  ${f.status} ${f.path} missing=[${f.missing.join(', ')}]`);
}
console.log('\n' + (passed === results.length ? 'RESULT: PASS' : 'RESULT: FAIL'));
process.exit(passed === results.length ? 0 : 1);
