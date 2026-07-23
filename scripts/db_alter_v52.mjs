// scripts/db_alter_v52.mjs
//
// Idempotent V52 migration for the `site_settings` table:
//   1. Ensure the `sslCerts` JSONB column exists (default '[]').
//   2. Ensure `forceHttps` exists with default true for NEW rows. We must NOT
//      overwrite existing live rows (which may legitimately be false) — Postgres
//      ADD COLUMN ... DEFAULT only back-fills rows created in that transaction,
//      so existing rows keep their current value.
//   3. If `sslCerts` is empty and the legacy V51 `sslCertPath` exists, fold the
//      legacy single-group values into `sslCerts[0]` (enabled = legacy sslEnabled).
//
// Uses the generated Prisma client. Safe to run repeatedly.
//
// Usage: node scripts/db_alter_v52.mjs   (or: npm run db:alter:v52)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TABLE = 'site_settings';

/** Best-effort domain guess from a cert path, e.g. /etc/nginx/ssl/www/full.pem → www */
function guessDomain(certPath) {
  const m = /\/ssl\/([^/]+)\//.exec(certPath || '');
  return m ? m[1] : 'localhost';
}

async function columnExists(column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    TABLE,
    column
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function addColumnIfNotExists(column, definition) {
  if (await columnExists(column)) {
    console.log(`[db_alter_v52] column ${TABLE}.${column} already exists — skip`);
    return false;
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE "${TABLE}" ADD COLUMN "${column}" ${definition}`);
  console.log(`[db_alter_v52] added column ${TABLE}.${column}`);
  return true;
}

async function main() {
  // 1. V52 multi-domain certificate list.
  await addColumnIfNotExists('sslCerts', `JSONB DEFAULT '[]'::jsonb`);

  // 2. forceHttps default true (existing rows are untouched).
  await addColumnIfNotExists('forceHttps', `BOOLEAN NOT NULL DEFAULT true`);

  // 3. Fold legacy V51 single-group values into sslCerts[0] when empty.
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, "sslCertPath", "sslKeyPath", "sslEnabled" FROM "${TABLE}"`
  );
  for (const row of rows) {
    const cur = await prisma.$queryRawUnsafe(
      `SELECT "sslCerts" FROM "${TABLE}" WHERE id = $1`,
      row.id
    );
    const certs = cur && cur[0] && cur[0].sslCerts;
    const isEmpty = !certs || (Array.isArray(certs) && certs.length === 0);
    if (isEmpty && row.sslCertPath) {
      const migrated = [
        {
          domain: guessDomain(row.sslCertPath),
          certPath: row.sslCertPath,
          keyPath: row.sslKeyPath || '',
          enabled: !!row.sslEnabled,
        },
      ];
      await prisma.$executeRawUnsafe(
        `UPDATE "${TABLE}" SET "sslCerts" = $1::jsonb WHERE id = $2`,
        JSON.stringify(migrated),
        row.id
      );
      console.log(`[db_alter_v52] migrated legacy SSL values into sslCerts for ${row.id}`);
    }
  }

  console.log('[db_alter_v52] migration complete.');
}

main()
  .catch((e) => {
    console.error('[db_alter_v52] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
