/**
 * seed-site.mjs — Safe, targeted seed for SiteSetting + global FAQ only.
 *
 * Seeds the `site_settings`, `site_faq_categories`, and `site_faq_items` tables
 * using the SAME source data as `npm run seed` (SITE_CONFIG + FAQ_CATEGORIES),
 * but deliberately touches NOTHING else (no categories / products / blogs /
 * companyInfo) so there is zero risk of overwriting operator-managed data.
 *
 * Re-running is always safe:
 *   - SiteSetting upserts with `update: {}`, so admin edits are NEVER overwritten.
 *   - FAQ items dedupe by (categoryId + exact question JSON) before inserting,
 *     so re-running never appends duplicate entries.
 *
 * Run: `npm run seed:site`  (uses tsx so the TS source imports resolve)
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// V49.22: pull the legacy site config + FAQ copy so we can seed the new
// SiteSetting / SiteFaq models. Reuses the exact same sources as seed.mjs.
import { SITE_CONFIG } from '../src/lib/site-config.ts';
import { FAQ_CATEGORIES } from '../src/lib/faq-data.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal .env loader (identical to seed.mjs) — reads DATABASE_URL from the
// project-root .env so `npm run seed:site` works without a global env.
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf-8');
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*?)"?\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
}
loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Create a .env file (see .env.example).');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  // ---------- SiteSetting (skip-if-exists) ----------
  // First run (no `main` row) writes defaults derived from SITE_CONFIG.
  // Re-seed passes `update: {}` so admin edits are NEVER overwritten.
  await prisma.siteSetting.upsert({
    where: { slug: 'main' },
    update: {},
    create: {
      slug: 'main',
      company: { en: SITE_CONFIG.company, zh: '广州秋彦科技有限公司', ar: SITE_CONFIG.company },
      email: SITE_CONFIG.email,
      phone: SITE_CONFIG.phone,
      address: { en: SITE_CONFIG.addressLine, zh: SITE_CONFIG.addressLine, ar: SITE_CONFIG.addressLine },
      addressLine: SITE_CONFIG.addressLine,
      socials: (SITE_CONFIG.sameAs || []).map((href) => ({ name: href, href })),
      sameAs: SITE_CONFIG.sameAs,
      ogImage: SITE_CONFIG.ogImage,
      twitterHandle: SITE_CONFIG.twitterHandle,
      keywords: { en: SITE_CONFIG.keywords, zh: [], ar: [] },
      defaultTitle: { en: SITE_CONFIG.defaultTitle, zh: SITE_CONFIG.defaultTitleZh, ar: SITE_CONFIG.defaultTitle },
      defaultDescription: {
        en: SITE_CONFIG.defaultDescription,
        zh: SITE_CONFIG.defaultDescriptionZh,
        ar: SITE_CONFIG.defaultDescription,
      },
    },
  });
  console.log('Seeded SiteSetting (main).');

  // ---------- Global FAQ (skip-if-exists) ----------
  // Upsert categories by stable `key`; for items, dedupe by (categoryId +
  // exact question JSON) so re-running seed never appends duplicate entries.
  const faqCatCount = FAQ_CATEGORIES.length;
  let faqItemCount = 0;
  for (const cat of FAQ_CATEGORIES) {
    const createdCat = await prisma.siteFaqCategory.upsert({
      where: { key: cat.id },
      update: { title: cat.title },
      create: { key: cat.id, title: cat.title, faqOrder: 0 },
    });
    for (let i = 0; i < cat.items.length; i++) {
      const item = cat.items[i];
      const existing = await prisma.siteFaqItem.findFirst({
        where: { categoryId: createdCat.id, question: { equals: item.question } },
      });
      if (existing) continue; // already seeded — skip
      await prisma.siteFaqItem.create({
        data: {
          categoryId: createdCat.id,
          question: item.question,
          answer: item.answer,
          faqOrder: i,
        },
      });
      faqItemCount++;
    }
  }
  console.log(`Seeded ${faqCatCount} FAQ categories and ${faqItemCount} new FAQ items.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
