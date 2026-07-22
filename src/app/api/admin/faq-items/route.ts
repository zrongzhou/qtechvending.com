import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** POST create a FAQ item under a category. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { categoryId?: unknown; question?: unknown; answer?: unknown; faqOrder?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
  if (!categoryId) return badRequestResponse('categoryId is required.');
  if (!body.question || typeof body.question !== 'object') {
    return badRequestResponse('question (object with en/zh/ar) is required.');
  }
  if (!body.answer || typeof body.answer !== 'object') {
    return badRequestResponse('answer (object with en/zh/ar) is required.');
  }

  try {
    const category = await prisma.siteFaqCategory.findUnique({ where: { id: categoryId } });
    if (!category) return notFoundResponse('FAQ category');

    const created = await prisma.siteFaqItem.create({
      data: {
        categoryId,
        question: body.question as object,
        answer: body.answer as object,
        faqOrder: typeof body.faqOrder === 'number' ? body.faqOrder : 0,
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[admin/faq-items] POST failed:', err);
    return serverErrorResponse();
  }
}
