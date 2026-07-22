// V51 migration: blog multi-image support.
//
// Idempotent raw-SQL migration that:
//   1) Adds the `images` (text[]) column to blog_posts if it does not exist.
//   2) Backfills legacy single `image` values into images[0] for rows that
//      have not yet been migrated (images is null / empty).
//   3) Drops the deprecated `image` column once data is migrated (guarded, so
//      re-running is a no-op).
//
// Run order: `npx prisma generate` (so the client knows `images`) then
// `node db_alter_v51.mjs`. Safe to run repeatedly.
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
  // Discover the real blog_posts table name (case-insensitive lookup).
  const found = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND lower(table_name) = 'blog_posts';`
  );
  const table = found?.[0]?.table_name;
  if (!table) throw new Error('blog_posts table not found');

  // 1) Add the new `images` (text[]) column idempotently.
  await p.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "images" TEXT[];`);
  console.log('ALTER OK: added images column (if not present)');

  // 2) Backfill: move legacy single `image` into images[0] for rows that do
  //    not yet have any images. Only runs if the deprecated `image` column is
  //    still present — on DBs where a previous migration already dropped it
  //    this is a safe no-op (guards re-runs).
  const imageCol = await p.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'image';`
  );
  if (imageCol?.length) {
    const backfill = await p.$executeRawUnsafe(`
      UPDATE "${table}"
      SET "images" = ARRAY["image"]
      WHERE "image" IS NOT NULL
        AND ("images" IS NULL OR array_length("images", 1) IS NULL);
    `);
    console.log('Backfill legacy image -> images[0]:', JSON.stringify(backfill));
  } else {
    console.log('Backfill skipped: legacy image column already dropped');
  }

  // 3) Drop the deprecated `image` column now that data is migrated.
  //    `IF EXISTS` keeps this idempotent (no-op on later runs).
  await p.$executeRawUnsafe(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "image";`);
  console.log('ALTER OK: dropped deprecated image column (if present)');

  // 4) Validate the result.
  const rows = await p.$queryRawUnsafe(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE "images" IS NOT NULL AND array_length("images", 1) > 0)::int AS with_images
     FROM "${table}";`
  );
  console.log('blog_posts images migration result:', JSON.stringify(rows));
} catch (e) {
  console.error('MIGRATION FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await p.$disconnect();
}
