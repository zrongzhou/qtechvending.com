import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const category = await prisma.siteFaqCategory.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: [{ faqOrder: 'asc' }, { createdAt: 'asc' }] } },
    });
    if (!category) return notFoundResponse('FAQ category');
    return NextResponse.json({ data: category });
  } catch (err) {
    console.error('[admin/faq-categories/[id]] GET failed:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { key?: unknown; title?: unknown; faqOrder?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const data: { key?: string; title?: object; faqOrder?: number } = {};
  if (typeof body.key === 'string' && body.key.trim()) data.key = body.key.trim();
  if (body.title && typeof body.title === 'object') data.title = body.title as object;
  if (typeof body.faqOrder === 'number') data.faqOrder = body.faqOrder;

  try {
    if (data.key) {
      const clash = await prisma.siteFaqCategory.findFirst({
        where: { key: data.key, NOT: { id: params.id } },
      });
      if (clash) return badRequestResponse('key already exists');
    }
    const updated = await prisma.siteFaqCategory.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('FAQ category');
    }
    console.error('[admin/faq-categories/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    await prisma.siteFaqCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('FAQ category');
    }
    console.error('[admin/faq-categories/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
