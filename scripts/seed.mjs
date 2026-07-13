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

// ---- Professionally rewritten About-page copy (replaces source Lorem ipsum) ----
// NOTE: English / Chinese copy is final. Arabic (ar) copy is AI-generated and
// still pending human review — TODO: ar 人工校对.
const ABOUT_SECTIONS = [
  {
    key: 'story',
    title: { en: 'Who We Are', zh: '关于我们', ar: 'من نحن' },
    body: {
      en: 'Guangzhou Qiuyan Technology Co., Ltd. (brand: Qtech) is a manufacturer of intelligent vending and fresh-flower / garden automation equipment. Since our founding we have focused on one thing: making reliable self-service machines that help operators sell around the clock with minimal staff.\n\nFrom fresh-flower vending to pizza, cotton-candy, coffee and juice machines, every Qtech product is engineered in our Guangzhou facility and validated across real deployment sites — subway stations, malls, campuses and convenience stores.',
      zh: '广州秋彦科技有限公司（品牌：Qtech）是一家智能售货与鲜花园艺自动化设备制造商。自成立以来，我们专注于一件事：打造可靠的无人自助设备，帮助运营商以最少的人力实现全天候销售。\n\n从鲜花售货机到披萨、棉花糖、咖啡与果汁设备，每一台 Qtech 产品都在我们的广州工厂研发，并在地铁站、商场、校园与便利店等真实场景中验证。',
      ar: 'شركة قوانغتشو تشيويان للتكنولوجيا (العلامة التجارية: Qtech) هي شركة تصنيع لأجهزة البيع الذكية ومعدات أتمتة الزهور والحدائق. منذ تأسيسنا ركزنا على شيء واحد: تقديم آلات خدمة ذاتية موثوقة تساعد المشغلين على البيع على مدار الساعة بأقل عدد من الموظفين.\n\nمن آلات بيع الزهور إلى البيتزا والقطن والقهوة والعصير، كل منتج من Qtech مصمم في منشأتنا في غوانغتشو ويخضع للتحقق في مواقع نشر حقيقية.',
    },
    image: '/images/about/company.svg',
  },
  {
    key: 'capabilities',
    title: { en: 'What We Build', zh: '我们的产品', ar: 'ماذا نصنع' },
    body: {
      en: 'Our core lines include fresh-flower vending machines (with cooling and remote management), hot-food vending such as pizza and french fries, and beverage systems covering coffee, juice, bubble tea, ice and popcorn. Each machine supports card and cashless payments, cloud-based inventory and sales reporting, and remote temperature and fault monitoring.',
      zh: '我们的核心产品线包括鲜花售货机（带制冷与远程管理）、披萨与薯条等热食售货设备，以及咖啡、果汁、奶茶、制冰与爆米花等饮品系统。每台设备均支持刷卡与无现金支付、基于云端的库存与销售报表，以及远程温控与故障监控。',
      ar: 'تشمل خطوطنا الأساسية آلات بيع الزهور الطازجة (مع التبريد والإدارة عن بُعد)، وأجهزة بيع الطعام الساخن مثل البيتزا والبطاطس المقلية، وأنظمة المشروبات التي تغطي القهوة والعصير والشاي باللؤلؤ والثلج والفشار. تدعم كل آلة الدفع بالبطاقة والدفع غير النقدي والتقارير السحابية والمتابعة عن بُعد.',
    },
    image: '/images/about/capabilities.svg',
  },
  {
    key: 'mission',
    title: { en: 'Our Mission', zh: '我们的使命', ar: 'مهمتنا' },
    body: {
      en: 'To make intelligent self-service equipment accessible and profitable for operators everywhere — through factory-direct pricing, OEM customization, and dependable after-sales support in English, Chinese and Arabic.',
      zh: '通过工厂直供的价格、OEM 定制能力，以及中文、英文、阿拉伯语的专业售后支持，让全球运营商都能用上并受益于智能自助设备。',
      ar: 'جعل معدات الخدمة الذاتية الذكية متاحة ومربحة للمشغلين في كل مكان — من خلال الأسعار المباشرة من المصنع والتخصيص (OEM) ودعم موثوق بلغات صينية وإنجليزية وعربية.',
    },
    image: '/images/about/mission.svg',
  },
];

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
        name: { en: c.name },
        icon: c.icon || '🏷️',
        description: c.description ? { en: c.description } : undefined,
        order: c.order ?? 0,
        status: 'active',
        type: 'product',
      },
      create: {
        slug: c.slug,
        name: { en: c.name },
        icon: c.icon || '🏷️',
        description: c.description ? { en: c.description } : undefined,
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
  let pCount = 0;
  for (const p of products) {
    const catSlugs = (p.categories || []).filter((s) => catMap.has(s));
    const featured = (p.order ?? 999) <= 8;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: { en: p.name },
        shortDescription: p.shortDescription ? { en: p.shortDescription } : undefined,
        description: p.description ? { en: p.description } : undefined,
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
        name: { en: p.name },
        shortDescription: p.shortDescription ? { en: p.shortDescription } : undefined,
        description: p.description ? { en: p.description } : undefined,
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
  for (const b of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: { en: b.title },
        excerpt: b.excerpt ? { en: b.excerpt } : undefined,
        content: { en: b.content },
        publishedAt: new Date(b.publishedAt),
        image: b.image || null,
        status: 'published',
      },
      create: {
        slug: b.slug,
        title: { en: b.title },
        excerpt: b.excerpt ? { en: b.excerpt } : undefined,
        content: { en: b.content },
        publishedAt: new Date(b.publishedAt),
        image: b.image || null,
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
