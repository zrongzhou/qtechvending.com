/**
 * QA verification for the sitemap.xml route fix (qtechvending).
 *
 * Executes the real GET handler from src/app/sitemap.xml/route.ts and asserts:
 *  - Response headers: Content-Type: application/xml, Cache-Control w/ max-age=3600,
 *    X-Content-Type-Options: nosniff
 *  - Body does NOT contain xhtml namespace declarations or <xhtml:link> alternates
 *  - Body IS a valid sitemap/0.9 document (urlset xmlns + loc/lastmod/changefreq/priority)
 *
 * The DB may be unreachable in this env; the route catches that and falls back to
 * static URLs only, which is sufficient to validate the XML shape/headers.
 */
import { GET } from '@/app/sitemap.xml/route';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Check {
  name: string;
  pass: boolean;
  detail?: string;
}

const checks: Check[] = [];

function expect(name: string, cond: boolean, detail = ''): void {
  checks.push({ name, pass: cond, detail });
}

async function main(): Promise<void> {
  const res = await GET();
  const body = await res.text();
  const contentType = res.headers.get('content-type');
  const cacheControl = res.headers.get('cache-control');
  const xcto = res.headers.get('x-content-type-options');

  // --- Header checks ---
  expect(
    'Content-Type is application/xml',
    contentType === 'application/xml',
    `(got "${contentType}")`,
  );
  expect(
    'Cache-Control contains max-age=3600',
    !!cacheControl && cacheControl.includes('max-age=3600') && cacheControl.includes('s-maxage=3600'),
    `(got "${cacheControl}")`,
  );
  expect(
    'X-Content-Type-Options is nosniff',
    xcto === 'nosniff',
    `(got "${xcto}")`,
  );

  // --- Body content checks (the actual bug fix) ---
  expect('Body has NO xmlns:xhtml', !body.includes('xmlns:xhtml'));
  expect('Body has NO xmlns:xsi', !body.includes('xmlns:xsi'));
  expect('Body has NO xsi:schemaLocation', !body.includes('xsi:schemaLocation'));
  expect('Body has NO xhtml:link alternate', !body.includes('xhtml:link'));
  expect(
    'Body uses sitemap/0.9 namespace',
    body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
  );
  expect('Body contains <loc>', body.includes('<loc>'));
  expect('Body contains <lastmod>', body.includes('<lastmod>'));
  expect('Body contains <changefreq>', body.includes('<changefreq>'));
  expect('Body contains <priority>', body.includes('<priority>'));
  expect('Body contains expected host', body.includes('https://www.qtechvending.com'));

  // Dump body for Python XML well-formedness validation
  const outPath = resolve(process.cwd(), 'scripts/qa/sitemap-out.xml');
  writeFileSync(outPath, body, 'utf8');
  console.log(`WROTE_BODY=${outPath}`);

  // --- Report ---
  let failed = 0;
  for (const c of checks) {
    const tag = c.pass ? 'PASS' : 'FAIL';
    if (!c.pass) failed++;
    console.log(`[${tag}] ${c.name}${c.detail ? ' ' + c.detail : ''}`);
  }
  console.log(`\nSUMMARY: ${checks.length - failed}/${checks.length} checks passed`);
  if (failed > 0) process.exit(1);
  console.log('LOCAL_ROUTE_OK');
}

main().catch((err) => {
  console.error('TEST_HARNESS_ERROR', err);
  process.exit(2);
});
