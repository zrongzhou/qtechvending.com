import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET categories with pagination + search (includes inactive). */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const search = (searchParams.get('search') || '').trim();

  try {
    let items: unknown[];
    let total: number;
    if (search) {
      const all = await prisma.category.findMany({ orderBy: [{ order: 'asc' }, { slug: 'asc' }] });
      const needle = search.toLowerCase();
      const filtered = (all as Array<{ slug?: string; name?: unknown }>).filter(
        (c) =>
          (c.slug || '').toLowerCase().includes(needle) ||
          JSON.stringify(c.name ?? '').toLowerCase().includes(needle)
      );
      total = filtered.length;
      items = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
    } else {
      const [rows, count] = await Promise.all([
        prisma.category.findMany({
          orderBy: [{ order: 'asc' }, { slug: 'asc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.category.count(),
      ]);
      items = rows;
      total = count;
    }
    return NextResponse.json({
      data: items,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error('[admin/categories] GET failed:', err);
    return serverErrorResponse();
  }
}

/** POST create a category. `slug` must be unique. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { slug?: unknown; name?: unknown; icon?: unknown; description?: unknown; order?: unknown; status?: unknown; type?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (!slug) return badRequestResponse('slug is required.');
  if (!body.name || typeof body.name !== 'object') {
    return badRequestResponse('name (object with en/zh/ar) is required.');
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return badRequestResponse('slug already exists');

    const created = await prisma.category.create({
      data: {
        slug,
        name: body.name as Prisma.InputJsonValue,
        icon: typeof body.icon === 'string' ? body.icon : null,
        description: (body.description as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        order: typeof body.order === 'number' ? body.order : 0,
        status: typeof body.status === 'string' ? body.status : 'active',
        type: typeof body.type === 'string' ? body.type : 'product',
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[admin/categories] POST failed:', err);
    return serverErrorResponse();
  }
}
