import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, notFoundResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Private admin data — never cache at the browser/CDN edge (see list route).
const NO_STORE_HEADERS: Record<string, string> = {
  'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt((await params).id, 10);
  if (!Number.isInteger(id)) return notFoundResponse('Message');

  let body: { isRead?: boolean };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: body.isRead === undefined ? true : body.isRead },
    });
    return NextResponse.json({ success: true, data: updated }, { headers: NO_STORE_HEADERS });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Message');
    }
    console.error('[admin/contact-messages/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt((await params).id, 10);
  if (!Number.isInteger(id)) return notFoundResponse('Message');

  try {
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Message');
    }
    console.error('[admin/contact-messages/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
