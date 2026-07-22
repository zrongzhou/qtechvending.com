import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET all FAQ categories with their items. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const categories = await prisma.siteFaqCategory.findMany({
      orderBy: [{ faqOrder: 'asc' }, { key: 'asc' }],
      include: { items: { orderBy: [{ faqOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    return NextResponse.json({ data: categories });
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
