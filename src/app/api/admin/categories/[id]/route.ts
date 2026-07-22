import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return notFoundResponse('Category');
    return NextResponse.json({ data: category });
  } catch (err) {
    console.error('[admin/categories/[id]] GET failed:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: { slug?: unknown; name?: unknown; icon?: unknown; description?: unknown; order?: unknown; status?: unknown; type?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const data: Prisma.CategoryUpdateInput = {};
  if (typeof body.slug === 'string' && body.slug.trim()) data.slug = body.slug.trim();
  if (body.name && typeof body.name === 'object') data.name = body.name as Prisma.InputJsonValue;
  if (typeof body.icon === 'string') data.icon = body.icon;
  if (body.description !== undefined) data.description = (body.description as Prisma.InputJsonValue) ?? Prisma.JsonNull;
  if (typeof body.order === 'number') data.order = body.order;
  if (typeof body.status === 'string') data.status = body.status;
  if (typeof body.type === 'string') data.type = body.type;

  try {
    if (data.slug) {
      const clash = await prisma.category.findFirst({ where: { slug: data.slug as string, NOT: { id: params.id } } });
      if (clash) return badRequestResponse('slug already exists');
    }
    const updated = await prisma.category.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Category');
    }
    console.error('[admin/categories/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Category');
    }
    console.error('[admin/categories/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
