/**
 * prisma/seed.ts — base seed for the QtechVending database.
 *
 * Creates:
 *   1. A default admin user (email/password from env, with safe defaults).
 *   2. A default CompanyInfo row (slug = "main") used by the About page.
 *
 * Product / Category / Blog data is seeded separately by `scripts/seed.mjs`
 * from the scraped JSON produced by `scripts/scrape.mjs`.
 *
 * Run with: `npm run db:seed`
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ---- Admin user ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@qtechvending.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'qtech-admin-2024';
  const adminName = process.env.ADMIN_NAME || 'Qtech Admin';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: 'admin' },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`[seed] admin user ensured: ${adminEmail}`);

  // ---- CompanyInfo default (slug = main) ----
  const existing = await prisma.companyInfo.findUnique({ where: { slug: 'main' } });
  if (!existing) {
    await prisma.companyInfo.create({
      data: {
        slug: 'main',
        sections: [
          {
            key: 'story',
            title: { en: 'Who We Are', zh: '关于我们', ar: 'من نحن' },
            body: {
              en: 'Guangzhou Qiuyan Technology Co., Ltd. (brand: Qtech) is a manufacturer of intelligent vending and fresh-flower / garden automation equipment, serving global distributors and operators.',
              zh: '广州秋彦科技有限公司（品牌：Qtech）是一家智能售货与鲜花/园艺自动化设备制造商，服务于全球经销商与运营商。',
              ar: 'شركة قوانغتشو تشيويان للتكنولوجيا (العلامة التجارية: Qtech) هي شركة تصنيع لأجهزة البيع الذكية ومعدات أتمتة الزهور والحدائق، وتخدم الموزعين والمشغلين حول العالم.',
            },
          },
        ],
      },
    });
    console.log('[seed] default CompanyInfo (slug=main) created');
  } else {
    console.log('[seed] CompanyInfo already present, skipped');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
