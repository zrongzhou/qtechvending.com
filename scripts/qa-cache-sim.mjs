// QA cache-hardening simulation: mirror src/middleware.ts decision logic and
// assert the final Cache-Control for representative paths. This replaces the
// older contact-messages stale-list sim (different concern).

const VALID_LOCALES = ['en', 'zh', 'ar'];
const NO_CACHE_SEGMENTS = ['account', 'login', 'register', 'cart', 'checkout', 'applications', 'managed-items', 'user'];
const ADMIN_NO_STORE = 'private, no-cache, no-store, max-age=0, must-revalidate';
const PUBLIC_CACHE = 'public, s-maxage=7776000, stale-while-revalidate=604800';

function isPublicCacheable(pathname, method) {
  if (method !== 'GET') return false;
  const seg = pathname.split('/').filter(Boolean)[0] || '';
  if (!VALID_LOCALES.includes(seg)) return false;
  if (pathname.includes('/api/')) return false;
  if (pathname.includes('/xiaozhouBackend')) return false;
  for (const s of NO_CACHE_SEGMENTS) {
    if (pathname.includes('/' + s)) return false;
  }
  return true;
}

// Reproduce the middleware's return order: admin branches BEFORE any withPublicCache.
function decide(pathname, method = 'GET') {
  const seg = pathname.split('/').filter(Boolean)[0] || '';
  if (seg === 'xiaozhouBackend') {
    return { cc: ADMIN_NO_STORE, kind: 'no-store (admin backend page)' };
  }
  if (pathname.startsWith('/api/admin')) {
    return { cc: ADMIN_NO_STORE, kind: 'no-store (admin API)' };
  }
  if (isPublicCacheable(pathname, method)) {
    return { cc: PUBLIC_CACHE, kind: 'public edge cache (90d)' };
  }
  return { cc: '(none — EO default)', kind: 'no no-store, no public s-maxage' };
}

const cases = [
  { path: '/api/admin/products', expect: 'no-store', desc: 'admin API' },
  { path: '/xiaozhouBackend/products', expect: 'no-store', desc: 'admin backend page' },
  { path: '/xiaozhouBackend/login', expect: 'no-store', desc: 'admin login page' },
  { path: '/en/products', expect: 'public', desc: 'locale public page' },
  { path: '/en/blog/my-post', expect: 'public', desc: 'locale public blog' },
  { path: '/api/blogs/my-post', expect: 'none', desc: 'public API (EO default)' },
];

let pass = 0;
console.log('=== QA Cache-Hardening Decision Simulation ===\n');
for (const c of cases) {
  const r = decide(c.path);
  const got = r.cc.includes('no-store') ? 'no-store' : r.cc.includes('s-maxage=7776000') ? 'public' : 'none';
  const ok = got === c.expect;
  if (ok) pass++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${c.path.padEnd(28)} → ${r.kind}`);
  console.log(`        Cache-Control: ${r.cc}`);
}
console.log(`\n=== ${pass}/${cases.length} passed ===`);
process.exit(pass === cases.length ? 0 : 1);
