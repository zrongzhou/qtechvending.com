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

  // === V49.22: SiteSetting / SiteFaqCategory / SiteFaqItem ===
  // 与 prisma/schema.prisma 的 @map / 字段 / 类型严格对应。
  // 全部用 IF NOT EXISTS（表）与 CREATE INDEX IF NOT EXISTS（索引），幂等可重复运行。
  // 注意：废弃了最初设计中的 defaultTitleZh 字段；FK 约束名与 @relation(map) 一致（SiteFaqItemCategory）。
  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "site_settings" (
      "id"                TEXT PRIMARY KEY,
      "slug"              TEXT NOT NULL UNIQUE,
      "company"           JSONB,
      "email"             TEXT,
      "phone"             TEXT,
      "address"           JSONB,
      "addressLine"       TEXT,
      "socials"           JSONB,
      "sameAs"            JSONB,
      "ogImage"           TEXT,
      "twitterHandle"     TEXT,
      "keywords"          JSONB,
      "defaultTitle"      JSONB,
      "defaultDescription" JSONB,
      "updatedAt"         TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "site_faq_categories" (
      "id"        TEXT PRIMARY KEY,
      "key"       TEXT NOT NULL UNIQUE,
      "title"     JSONB NOT NULL,
      "faqOrder"  INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "site_faq_items" (
      "id"        TEXT PRIMARY KEY,
      "categoryId" TEXT NOT NULL,
      "question"  JSONB NOT NULL,
      "answer"    JSONB NOT NULL,
      "faqOrder"  INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "SiteFaqItemCategory" FOREIGN KEY ("categoryId")
        REFERENCES "site_faq_categories" ("id") ON DELETE CASCADE
    );
  `);

  await p.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "site_faq_items_categoryId_faqOrder_idx"
      ON "site_faq_items" ("categoryId", "faqOrder");
  `);
  console.log('ALTER OK: site_settings / site_faq_categories / site_faq_items');
} catch (e) {
  console.error('ALTER FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await p.$disconnect();
}
