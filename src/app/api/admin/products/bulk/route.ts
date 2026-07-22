import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** PATCH bulk action over selected products: publish | unpublish | delete. */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { ids?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).filter((x) => typeof x === 'string') : [];
  const action = typeof body.action === 'string' ? body.action : '';
  if (!ids.length || (action !== 'publish' && action !== 'unpublish' && action !== 'delete')) {
    return badRequestResponse('ids (string[]) and a valid action (publish|unpublish|delete) are required.');
  }

  try {
    if (action === 'delete') {
      await prisma.product.deleteMany({ where: { id: { in: ids as string[] } } });
    } else {
      await prisma.product.updateMany({
        where: { id: { in: ids as string[] } },
        data: { status: action === 'publish' ? 'active' : 'inactive' },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products/bulk] PATCH failed:', err);
    return serverErrorResponse();
  }
}
