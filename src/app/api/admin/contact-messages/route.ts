import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const isRead = searchParams.get('isRead'); // 'all' | 'read' | 'unread'
  const search = (searchParams.get('search') || '').trim();

  const where: Record<string, unknown> = {};
  if (isRead === 'read') where.isRead = true;
  else if (isRead === 'unread') where.isRead = false;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return NextResponse.json({
    data: items,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
    pageSize: limit,
  });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { ids?: number[]; action?: 'read' | 'delete' };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((n) => Number.isInteger(n)) : [];
  const action = body.action;

  if (!ids.length || (action !== 'read' && action !== 'delete')) {
    return badRequestResponse('ids and a valid action (read|delete) are required.');
  }

  try {
    if (action === 'read') {
      await prisma.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true },
      });
    } else {
      await prisma.contactMessage.deleteMany({ where: { id: { in: ids } } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/contact-messages] PATCH failed:', err);
    return serverErrorResponse();
  }
}
