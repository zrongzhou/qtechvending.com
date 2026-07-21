/**
 * seed.mjs — Seed the scraped data into the `qtechvending` PostgreSQL database.
 *
 * Reads scripts/data/{categories,products,blogs}.json (produced by
 * `npm run scrape` + `npm run download:images`) and upserts into Prisma models.
 * Also writes a professionally-rewritten CompanyInfo (About page) so the live
 * site never shows the source Lorem ipsum.
 *
 * Run: `npm run seed`
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

// Minimal .env loader (so `npm run seed` works without a global env).
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

/**
 * Normalize a data-file value into the DB `Json` i18n shape `{ en, zh, ar }`.
 *
 * The scraped data files may store these fields as either a plain English
 * string (legacy) or as a fully translated `{ en, zh, ar }` object (after
 * `fix-i18n-names.mjs`). This helper accepts both and guarantees every locale
 * key is present, falling back to English so the UI never renders an empty
 * string in any language.
 */
function toI18n(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return { en: value, zh: value, ar: value };
  if (typeof value === 'object') {
    const o = value;
    const en = typeof o.en === 'string' && o.en ? o.en : typeof o.zh === 'string' ? o.zh : typeof o.ar === 'string' ? o.ar : '';
    return {
      en,
      zh: typeof o.zh === 'string' && o.zh ? o.zh : en,
      ar: typeof o.ar === 'string' && o.ar ? o.ar : en,
    };
  }
  return undefined;
}

// ---- Professionally rewritten About-page copy (replaces source Lorem ipsum) ----
// NOTE: English / Chinese copy is final. Arabic (ar) copy is AI-generated and
// still pending human review — TODO: ar 人工校对.
const ABOUT_SECTIONS = [{"key": "story", "title": {"en": "Who We Are", "zh": "关于我们", "ar": "من نحن"}, "body": {"en": "Qtech Vending is a smart vending machine manufacturer with more than 10 years of experience in the automated retail industry. We started with traditional snack and drink vending machines and have continued to expand into flower vending machines, pizza vending machines, hot food vending machines, ice vending machines, fresh food machines, and customized vending solutions for different business needs.\n\nWe understand that customers are not just buying a machine. They are looking for a reliable way to extend business hours, reduce labor costs, improve customer convenience, and create new sales opportunities. That is why we focus on practical solutions based on what customers want to sell, where the machine will be used, how users will pay, and how the business will operate.\n\nWith a customer-centered mindset, Qtech Vending continues to improve product quality, user experience, payment systems, remote management, and customization options. We aim to help operators, retailers, distributors, and venue owners build smart, flexible, and profitable 24/7 self-service businesses.", "zh": "广州秋彦科技有限公司（品牌：Qtech）是一家智能售货与鲜花园艺自动化设备制造商。自成立以来，我们专注于一件事：打造可靠的无人自助设备，帮助运营商以最少的人力实现全天候销售。\n\n从鲜花售货机到披萨、棉花糖、咖啡与果汁设备，每一台 Qtech 产品都在我们的广州工厂研发，并在地铁站、商场、校园与便利店等真实场景中验证。", "ar": "شركة قوانغتشو تشيويان للتكنولوجيا (العلامة التجارية: Qtech) هي شركة تصنيع لأجهزة البيع الذكية ومعدات أتمتة الزهور والحدائق. منذ تأسيسنا ركزنا على شيء واحد: تقديم آلات خدمة ذاتية موثوقة تساعد المشغلين على البيع على مدار الساعة بأقل عدد من الموظفين.\n\nمن آلات بيع الزهور إلى البيتزا والقطن والقهوة والعصير، كل منتج من Qtech مصمم في منشأتنا في غوانغتشو ويخضع للتحقق في مواقع نشر حقيقية."}, "image": "/images/about/company.svg"}, {"key": "capability", "title": {"en": "Why Choose Us", "zh": "为什么选择我们", "ar": "لماذا تختارنا"}, "body": {"en": "Qtech Vending has more than 10 years of manufacturing experience in the vending machine industry. We understand that customers need more than a machine. They need a reliable solution that fits their product, location, payment method and business model.\n\nOur R&D team supports customized vending machine projects, including cabinet design, product layout, payment systems, software functions and branding. From sheet metal materials to assembly and testing, we follow strict QC control to reduce machine failure rates and improve long-term operation.\n\nWith our own sheet metal factory, we can better control production quality, delivery schedule and cost. This allows us to offer competitive pricing, usually about 3% lower than many comparable market options, while still keeping the machine reliable and practical for real business use.", "zh": "Qtech 拥有 10 年以上售货机行业制造经验。我们深知客户需要的不仅是一台机器，更是一套契合其产品、场地、支付方式与商业模式的可靠方案。\n\n我们的研发团队支持定制化售货机开发，从外观、货道到软件后台均可按需求调整；严格的质量控制贯穿来料、组装与出厂全流程；工厂直供的价格让运营商获得更高的利润空间。", "ar": "تمتلك Qtech أكثر من 10 سنوات من الخبرة التصنيعية في صناعة آلات البيع. نحن ندرك أن العملاء يحتاجون إلى أكثر من مجرد آلة — بل حل موثوق يناسب منتجهم وموقعهم وطريقة الدفع ونموذج أعمالهم.\n\nيدعم فريق البحث والتطوير لدينا تطوير آلات بيع مخصصة، من المظهر إلى قنوات المنتج وبرنامج الخلفية؛ ورقابة جودة صارمة عبر الاستلام والتجميع والشحن؛ وأسعار مباشرة من المصنع تمنح المشغلين هامش ربح أعلى."}, "image": "/images/about/capabilities.svg"}, {"key": "mission", "title": {"en": "Our Mission", "zh": "我们的使命", "ar": "مهمتنا"}, "body": {"en": "To make intelligent self-service equipment accessible and profitable for operators everywhere — through factory-direct pricing, OEM customization, and dependable after-sales support in English, Chinese and Arabic.", "zh": "通过工厂直供的价格、OEM 定制能力，以及中文、英文、阿拉伯语的专业售后支持，让全球运营商都能用上并受益于智能自助设备。", "ar": "جعل معدات الخدمة الذاتية الذكية متاحة ومربحة للمشغلين في كل مكان — من خلال الأسعار المباشرة من المصنع والتخصيص (OEM) ودعم موثوق بلغات صينية وإنجليزية وعربية."}, "image": "/images/about/mission.svg"}];


async function main() {
  // ---------- Categories ----------
  const categoriesPath = join(DATA_DIR, 'categories.json');
  let categories = [];
  if (existsSync(categoriesPath)) {
    categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));
  }
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: toI18n(c.name),
        icon: c.icon || '🏷️',
        description: toI18n(c.description),
        order: c.order ?? 0,
        status: 'active',
        type: 'product',
      },
      create: {
        slug: c.slug,
        name: toI18n(c.name),
        icon: c.icon || '🏷️',
        description: toI18n(c.description),
        order: c.order ?? 0,
        status: 'active',
        type: 'product',
      },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const catRows = await prisma.category.findMany({ select: { slug: true, id: true } });
  const catMap = new Map(catRows.map((c) => [c.slug, c.id]));

  // ---------- Products ----------
  const productsPath = join(DATA_DIR, 'products.json');
  let products = [];
  if (existsSync(productsPath)) {
    products = JSON.parse(readFileSync(productsPath, 'utf-8'));
  }

  // V49.15: the catalog was fully replaced with new slugs. Remove any products
  // or categories that are no longer in the incoming set so they don't linger
  // as orphaned/empty entries in listings and nav.
  const newProductSlugs = products.map((p) => p.slug);
  if (newProductSlugs.length) {
    const deletedProducts = await prisma.product.deleteMany({
      where: { slug: { notIn: newProductSlugs } },
    });
    if (deletedProducts.count) console.log(`Removed ${deletedProducts.count} stale product(s).`);
  }
  const newCatSlugs = categories.map((c) => c.slug);
  if (newCatSlugs.length) {
    const deletedCats = await prisma.category.deleteMany({
      where: { slug: { notIn: newCatSlugs } },
    });
    if (deletedCats.count) console.log(`Removed ${deletedCats.count} stale categor(y/ies).`);
  }

  let pCount = 0;
  for (const p of products) {
    const catSlugs = (p.categories || []).filter((s) => catMap.has(s));
    const featured = (p.order ?? 999) <= 8;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: toI18n(p.name),
        displayTitle: toI18n(p.displayTitle),
        shortDescription: toI18n(p.shortDescription),
        description: toI18n(p.description),
        features: p.features ?? null,
        faq: p.faq ?? null,
        seoTitle: toI18n(p.seoTitle),
        seoDescription: toI18n(p.seoDescription),
        seoKeywords: p.seoKeywords ?? null,
        images: p.images || [],
        specs: p.specs || [],
        sku: p.sku,
        order: p.order ?? 0,
        featured,
        categories: { set: catSlugs.map((s) => ({ slug: s })) },
      },
      create: {
        slug: p.slug,
        sku: p.sku,
        name: toI18n(p.name),
        displayTitle: toI18n(p.displayTitle),
        shortDescription: toI18n(p.shortDescription),
        description: toI18n(p.description),
        features: p.features ?? null,
        faq: p.faq ?? null,
        seoTitle: toI18n(p.seoTitle),
        seoDescription: toI18n(p.seoDescription),
        seoKeywords: p.seoKeywords ?? null,
        images: p.images || [],
        specs: p.specs || [],
        order: p.order ?? 0,
        featured,
        categories: { connect: catSlugs.map((s) => ({ slug: s })) },
      },
    });
    pCount++;
  }
  console.log(`Seeded ${pCount} products.`);

  // ---------- Blogs ----------
  const blogsPath = join(DATA_DIR, 'blogs.json');
  let blogs = [];
  if (existsSync(blogsPath)) {
    blogs = JSON.parse(readFileSync(blogsPath, 'utf-8'));
  }
  let bCount = 0;
  // V49.20: the blog set is fully replaced from the docx. Remove any posts
  // whose slug is no longer in the incoming file so stale entries don't linger.
  const newBlogSlugs = blogs.map((b) => b.slug);
  if (newBlogSlugs.length) {
    const deletedBlogs = await prisma.blogPost.deleteMany({
      where: { slug: { notIn: newBlogSlugs } },
    });
    if (deletedBlogs.count) console.log(`Removed ${deletedBlogs.count} stale blog post(s).`);
  }
  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: toI18n(b.title),
        excerpt: toI18n(b.excerpt),
        content: toI18n(b.content),
        publishedAt: new Date(b.publishedAt),
        image: b.image || null,
        seoTitle: toI18n(b.seoTitle),
        seoKeywords: b.seoKeywords ?? null,
        status: 'published',
      },
      create: {
        slug: b.slug,
        title: toI18n(b.title),
        excerpt: toI18n(b.excerpt),
        content: toI18n(b.content),
        publishedAt: new Date(b.publishedAt),
        image: b.image || null,
        seoTitle: toI18n(b.seoTitle),
        seoKeywords: b.seoKeywords ?? null,
        status: 'published',
        author: 'Qtech Team',
      },
    });
    bCount++;
  }
  console.log(`Seeded ${bCount} blog posts.`);

  // ---------- CompanyInfo (About) ----------
  await prisma.companyInfo.upsert({
    where: { slug: 'main' },
    update: { sections: ABOUT_SECTIONS },
    create: { slug: 'main', sections: ABOUT_SECTIONS },
  });
  console.log('Seeded CompanyInfo (About page).');

  console.log('\nSeed complete.');
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
