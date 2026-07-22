import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { categories: true },
    });
    if (!product) return notFoundResponse('Product');
    return NextResponse.json({ data: product });
  } catch (err) {
    console.error('[admin/products/[id]] GET failed:', err);
    return serverErrorResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const data: Record<string, unknown> = {};
  const stringFields = ['slug', 'sku', 'status'];
  const jsonFields = ['name', 'displayTitle', 'description', 'shortDescription', 'features', 'seoTitle', 'seoDescription', 'seoKeywords'];
  const arrayFields = ['images', 'relatedProducts', 'specs', 'faq'];
  for (const f of stringFields) {
    if (typeof body[f] === 'string') data[f] = body[f];
  }
  for (const f of jsonFields) {
    if (body[f] !== undefined) data[f] = body[f] as object;
  }
  for (const f of arrayFields) {
    if (Array.isArray(body[f])) data[f] = body[f];
  }
  if (typeof body.featured === 'boolean') data.featured = body.featured;
  if (typeof body.order === 'number') data.order = body.order;

  // categories is a slug[]; replace the relation set.
  if (Array.isArray(body.categories)) {
    const slugs = (body.categories as unknown[]).filter((s) => typeof s === 'string') as string[];
    data.categories = { set: slugs.map((s) => ({ slug: s })) };
  }

  try {
    if (data.slug) {
      const clash = await prisma.product.findFirst({ where: { slug: data.slug as string, NOT: { id: params.id } } });
      if (clash) return badRequestResponse('slug already exists');
    }
    if (data.sku) {
      const clash = await prisma.product.findFirst({ where: { sku: data.sku as string, NOT: { id: params.id } } });
      if (clash) return badRequestResponse('sku already exists');
    }
    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { categories: true },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Product');
    }
    console.error('[admin/products/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Product');
    }
    console.error('[admin/products/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
