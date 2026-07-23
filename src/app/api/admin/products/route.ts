import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET products with pagination / search / status / featured filters. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const search = (searchParams.get('search') || '').trim();
  const status = searchParams.get('status');
  const featuredParam = searchParams.get('featured');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (featuredParam === 'true') where.featured = true;
  else if (featuredParam === 'false') where.featured = false;

  // DB-side search. Previously the whole table was pulled into memory and
  // filtered in JS, which is slow at scale. Now the filter runs in the DB.
  // `name` is a JSON i18n field ({ en, zh, ar }), so we match every language
  // path with `string_contains`. Prisma JSON filters do NOT support
  // `mode: 'insensitive'`, so we match both the original and lowercased needle
  // to keep search case-insensitive. `sku`/`slug` are plain strings and use
  // `mode: 'insensitive'` directly.
  if (search) {
    const needle = search.toLowerCase();
    where.OR = [
      { name: { path: ['en'], string_contains: search } },
      { name: { path: ['zh'], string_contains: search } },
      { name: { path: ['ar'], string_contains: search } },
      { name: { path: ['en'], string_contains: needle } },
      { name: { path: ['zh'], string_contains: needle } },
      { name: { path: ['ar'], string_contains: needle } },
      { sku: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ order: 'asc' }, { sku: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { categories: true },
      }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({
      data: items,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error('[admin/products] GET failed:', err);
    return serverErrorResponse();
  }
}

/** POST create a product. `slug` and `sku` must be unique. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const sku = typeof body.sku === 'string' ? body.sku.trim() : '';
  if (!slug) return badRequestResponse('slug is required.');
  if (!sku) return badRequestResponse('sku is required.');
  if (!body.name || typeof body.name !== 'object') {
    return badRequestResponse('name (object with en/zh/ar) is required.');
  }

  const categories = Array.isArray(body.categories)
    ? (body.categories as unknown[]).filter((s) => typeof s === 'string')
    : [];
  const faq = Array.isArray(body.faq) ? body.faq : null;

  try {
    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) return badRequestResponse('slug already exists');
    const skuExists = await prisma.product.findUnique({ where: { sku } });
    if (skuExists) return badRequestResponse('sku already exists');

    const created = await prisma.product.create({
      data: {
        slug,
        sku,
        name: body.name as object,
        displayTitle: (body.displayTitle as object) ?? null,
        description: (body.description as object) ?? null,
        shortDescription: (body.shortDescription as object) ?? null,
        images: Array.isArray(body.images) ? (body.images as string[]) : [],
        features: (body.features as object) ?? null,
        specs: Array.isArray(body.specs) ? (body.specs as object[]) : [],
        status: typeof body.status === 'string' ? body.status : 'active',
        featured: typeof body.featured === 'boolean' ? body.featured : false,
        order: typeof body.order === 'number' ? body.order : 0,
        relatedProducts: Array.isArray(body.relatedProducts) ? (body.relatedProducts as string[]) : [],
        seoTitle: (body.seoTitle as object) ?? null,
        seoDescription: (body.seoDescription as object) ?? null,
        seoKeywords: (body.seoKeywords as object) ?? null,
        faq: (faq as object) ?? null,
        categories: { connect: categories.map((s) => ({ slug: s })) },
      },
      include: { categories: true },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[admin/products] POST failed:', err);
    return serverErrorResponse();
  }
}
