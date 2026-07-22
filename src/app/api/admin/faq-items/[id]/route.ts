import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { question?: unknown; answer?: unknown; faqOrder?: unknown; categoryId?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const data: { question?: object; answer?: object; faqOrder?: number; categoryId?: string } = {};
  if (body.question && typeof body.question === 'object') data.question = body.question as object;
  if (body.answer && typeof body.answer === 'object') data.answer = body.answer as object;
  if (typeof body.faqOrder === 'number') data.faqOrder = body.faqOrder;
  if (typeof body.categoryId === 'string' && body.categoryId.trim()) data.categoryId = body.categoryId.trim();

  try {
    const updated = await prisma.siteFaqItem.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('FAQ item');
    }
    console.error('[admin/faq-items/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    await prisma.siteFaqItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('FAQ item');
    }
    console.error('[admin/faq-items/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
