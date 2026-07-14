// QA: Route smoke test for the QtechVending trilingual site — Round 2 regression.
// Expected env: NO database (no .env / no DATABASE_URL). Per the fix for
// Bug A, data pages must render the shell with HTTP 200 (empty data) instead
// of 500. Per the fix for Bug B, /ar must ship <html lang="ar" dir="rtl"> at SSR.
// Detail/category routes for a slug that does not exist in the (empty) DB are
// allowed to 404 gracefully (notFound) — that is correct behavior.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const DATA = path.resolve('scripts/data');
let productSlug = '';
let categorySlug = '';
try {
  productSlug = JSON.parse(fs.readFileSync(path.join(DATA, 'products.json'), 'utf8'))[0]?.slug || '';
  categorySlug = JSON.parse(fs.readFileSync(path.join(DATA, 'categories.json'), 'utf8'))[0]?.slug || '';
} catch { /* ignore */ }

// acceptableStatus: a Set of statuses considered a PASS for that route.
// markers (lowercased, matched case-insensitively against lowercased body).
const ROUTES = [
  { path: '/en', status: new Set([200]), markers: ['qtech', 'products', 'blog', 'about', 'contact', 'lang="en"'] },
  { path: '/zh', status: new Set([200]), markers: ['qtech', 'lang="zh"'] },
  { path: '/ar', status: new Set([200]), markers: ['qtech', 'lang="ar"', 'dir="rtl"'] },
  { path: '/en/products', status: new Set([200]), markers: ['products', 'qtech'] },
  { path: `/en/products/${productSlug}`, status: new Set([200, 404]), markers: [] },
  { path: `/en/category/${categorySlug}`, status: new Set([200, 404]), markers: [] },
  { path: '/en/blog', status: new Set([200]), markers: ['blog', 'qtech'] },
  { path: '/en/about', status: new Set([200]), markers: ['about', 'qtech'] },
  { path: '/en/contact', status: new Set([200]), markers: ['name', 'email', 'phone', 'company', 'country', 'product', 'subject', 'message'] },
  { path: '/xiaozhouBackend/login', status: new Set([200]), markers: ['qtech'] },
  // SEO spot-check on /en (hreflang alternates + meta).
  { path: '/en', status: new Set([200]), markers: ['hreflang', 'x-default', '<title>', 'name="description"', 'og:'], tag: 'SEO' },
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
  const low = body.toLowerCase();
  const missing = r.markers.filter((m) => !low.includes(m.toLowerCase()));
  // For routes we only assert status (detail/category/sEO), skip marker check when empty.
  const markerOk = r.markers.length === 0 ? true : missing.length === 0;
  const ok = r.status.has(status) && markerOk;
  results.push({ path: r.path, status, missing, ok, tag: r.tag });
  const extra = r.tag ? ` [${r.tag}]` : '';
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${status}  ${r.path}${extra}` +
      (!ok && missing.length ? `  missing=[${missing.join(', ')}]` : '')
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
