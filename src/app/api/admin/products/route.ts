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

  try {
    if (search) {
      const all = await prisma.product.findMany({
        where,
        orderBy: [{ order: 'asc' }, { sku: 'asc' }],
        include: { categories: true },
      });
      const needle = search.toLowerCase();
      const filtered = (all as Array<{ name?: unknown; sku?: string; slug?: string }>).filter(
        (p) =>
          JSON.stringify(p.name ?? '').toLowerCase().includes(needle) ||
          (p.sku || '').toLowerCase().includes(needle) ||
          (p.slug || '').toLowerCase().includes(needle)
      );
      const total = filtered.length;
      return NextResponse.json({
        data: filtered.slice((page - 1) * limit, (page - 1) * limit + limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        page,
        pageSize: limit,
      });
    }

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
