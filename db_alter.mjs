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
  // The Prisma `Product` model maps to a physical table (likely lowercase `products`).
  // Discover the real table name case-insensitively.
  const found = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND lower(table_name) = 'products';`
  );
  const table = found?.[0]?.table_name;
  if (!table) throw new Error('Product table not found');
  console.log('Target table:', table);

  await p.$executeRawUnsafe(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "faq" JSONB;`
  );
  console.log('ALTER OK');

  const cols = await p.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = 'faq';`,
    table
  );
  console.log('faq column:', JSON.stringify(cols));

  // V49.20: add seoTitle to blog_posts so the docx-authored SEO Title is stored.
  const blogTable = await p.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND lower(table_name) = 'blog_posts';`
  );
  const bt = blogTable?.[0]?.table_name;
  if (!bt) throw new Error('blog_posts table not found');
  await p.$executeRawUnsafe(
    `ALTER TABLE "${bt}" ADD COLUMN IF NOT EXISTS "seoTitle" JSONB;`
  );
  const bcols = await p.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = 'seoTitle';`,
    bt
  );
  console.log('blog_posts.seoTitle column:', JSON.stringify(bcols));
} catch (e) {
  console.error('ALTER FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await p.$disconnect();
}
