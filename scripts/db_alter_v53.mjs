// scripts/db_alter_v53.mjs
//
// Idempotent V53 migration for the `blog_posts` table:
//   Add the `seoDescription` TEXT column (single-language meta description used
//   for the blog post's <meta name="description">, distinct from the excerpt).
//
// Uses the generated Prisma client. Safe to run repeatedly (ADD COLUMN IF NOT
// EXISTS). Back-fills nothing — existing rows simply get NULL, which the blog
// detail page already treats as "fall back to the excerpt".
//
// Usage: node scripts/db_alter_v53.mjs   (or: npm run db:alter:v53)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TABLE = 'blog_posts';

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
    console.log(`[db_alter_v53] column ${TABLE}.${column} already exists — skip`);
    return false;
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE "${TABLE}" ADD COLUMN "${column}" ${definition}`);
  console.log(`[db_alter_v53] added column ${TABLE}.${column}`);
  return true;
}

async function main() {
  // V53: single-language SEO description for blog posts.
  await addColumnIfNotExists('seoDescription', `TEXT`);

  console.log('[db_alter_v53] migration complete.');
}

main()
  .catch((e) => {
    console.error('[db_alter_v53] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
