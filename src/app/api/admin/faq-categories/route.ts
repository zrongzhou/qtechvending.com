import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET FAQ categories (paginated + searchable) with their items.
 *  Returns the shared `Paginated<T>` envelope used by other admin list APIs. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const search = (searchParams.get('search') || '').trim();

  try {
    const all = await prisma.siteFaqCategory.findMany({
      orderBy: [{ faqOrder: 'asc' }, { key: 'asc' }],
      include: { items: { orderBy: [{ faqOrder: 'asc' }, { createdAt: 'asc' }] } },
    });

    const needle = search.toLowerCase();
    const filtered = needle
      ? (all as Array<{ key?: string; title?: unknown }>).filter(
          (c) =>
            (c.key || '').toLowerCase().includes(needle) ||
            JSON.stringify(c.title ?? '').toLowerCase().includes(needle)
        )
      : all;

    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);

    return NextResponse.json({
      data,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error('[admin/faq-categories] GET failed:', err);
    return serverErrorResponse();
  }
}

/** POST create a FAQ category. `key` must be unique. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { key?: unknown; title?: unknown; faqOrder?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!key) return badRequestResponse('key is required.');
  if (!body.title || typeof body.title !== 'object') {
    return badRequestResponse('title (object with en/zh/ar) is required.');
  }

  try {
    const existing = await prisma.siteFaqCategory.findUnique({ where: { key } });
    if (existing) return badRequestResponse('key already exists');

    const created = await prisma.siteFaqCategory.create({
      data: {
        key,
        title: body.title as object,
        faqOrder: typeof body.faqOrder === 'number' ? body.faqOrder : 0,
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[admin/faq-categories] POST failed:', err);
    return serverErrorResponse();
  }
}
