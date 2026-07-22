import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse, notFoundResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) return notFoundResponse('Blog post');
    return NextResponse.json({ data: post });
  } catch (err) {
    console.error('[admin/blogs/[id]] GET failed:', err);
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
  const stringFields = ['slug', 'author', 'status', 'image'];
  const jsonFields = ['title', 'excerpt', 'content', 'seoTitle', 'seoKeywords'];
  for (const f of stringFields) {
    if (typeof body[f] === 'string') data[f] = body[f];
  }
  for (const f of jsonFields) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  if (typeof body.featured === 'boolean') data.featured = body.featured;
  if (typeof body.publishedAt === 'string' && body.publishedAt) data.publishedAt = new Date(body.publishedAt);

  try {
    if (data.slug) {
      const clash = await prisma.blogPost.findFirst({
        where: { slug: data.slug as string, NOT: { id: params.id } },
      });
      if (clash) return badRequestResponse('slug already exists');
    }
    const updated = await prisma.blogPost.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Blog post');
    }
    console.error('[admin/blogs/[id]] PATCH failed:', err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  try {
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
      return notFoundResponse('Blog post');
    }
    console.error('[admin/blogs/[id]] DELETE failed:', err);
    return serverErrorResponse();
  }
}
