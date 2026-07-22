// V51b migration: SiteSetting SSL / HTTPS enforcement fields (T10).
//
// Idempotent raw-SQL migration that adds the following columns to
// `site_settings` only when they do not already exist:
//   - forceHttps  BOOLEAN NOT NULL DEFAULT false
//   - sslCertPath TEXT   (nullable)
//   - sslKeyPath   TEXT   (nullable)
//   - sslEnabled   BOOLEAN NOT NULL DEFAULT false
//
// Safe to run repeatedly (every statement uses IF NOT EXISTS / guards).
//
// Run order: `npx prisma generate` (so the client knows the new fields) then
// `node db_alter_v51b.mjs`.
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const e = join(__dirname, '.env');
  if (!existsSync(e)) return;
  for (const l of readFileSync(e, 'utf-8').split('\n')) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*?)"?\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const p = new PrismaClient();
try {
  // Discover the real site_settings table name (case-insensitive lookup).
  const found = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND lower(table_name) = 'site_settings';`
  );
  const table = found?.[0]?.table_name;
  if (!table) throw new Error('site_settings table not found');

  // 1) Add forceHttps (boolean, default false) — idempotent.
  await p.$executeRawUnsafe(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "forceHttps" BOOLEAN NOT NULL DEFAULT false;`
  );
  console.log('ALTER OK: added forceHttps column (if not present)');

  // 2) Add sslCertPath (text, nullable) — idempotent.
  await p.$executeRawUnsafe(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "sslCertPath" TEXT;`
  );
  console.log('ALTER OK: added sslCertPath column (if not present)');

  // 3) Add sslKeyPath (text, nullable) — idempotent.
  await p.$executeRawUnsafe(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "sslKeyPath" TEXT;`
  );
  console.log('ALTER OK: added sslKeyPath column (if not present)');

  // 4) Add sslEnabled (boolean, default false) — idempotent.
  await p.$executeRawUnsafe(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "sslEnabled" BOOLEAN NOT NULL DEFAULT false;`
  );
  console.log('ALTER OK: added sslEnabled column (if not present)');

  // 5) Validate the result.
  const rows = await p.$queryRawUnsafe(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE "forceHttps" = true)::int AS force_https,
            count(*) FILTER (WHERE "sslEnabled" = true)::int AS ssl_enabled
     FROM "${table}";`
  );
  console.log('site_settings SSL migration result:', JSON.stringify(rows));
} catch (e) {
  console.error('MIGRATION FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await p.$disconnect();
}
