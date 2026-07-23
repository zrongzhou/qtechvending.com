import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin, unauthorizedResponse, badRequestResponse, serverErrorResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET blog posts with pagination / search / status filter. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 100);
  const search = (searchParams.get('search') || '').trim();
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  try {
    if (search) {
      const all = await prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' } });
      const needle = search.toLowerCase();
      const filtered = (all as Array<{ title?: unknown; slug?: string }>).filter(
        (p) =>
          JSON.stringify(p.title ?? '').toLowerCase().includes(needle) ||
          (p.slug || '').toLowerCase().includes(needle)
      );
      const total = filtered.length;
      return NextResponse.json({
        data: filtered.slice((page - 1) * limit, (page - 1) * limit + limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        page,
        pageSize: limit,
      });
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);
    return NextResponse.json({
      data: items,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error('[admin/blogs] GET failed:', err);
    return serverErrorResponse();
  }
}

/** POST create a blog post. `slug` must be unique. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return unauthorizedResponse();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequestResponse('Invalid request body.');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (!slug) return badRequestResponse('slug is required.');
  if (!body.title || typeof body.title !== 'object') {
    return badRequestResponse('title (object with en/zh/ar) is required.');
  }
  if (!body.content || typeof body.content !== 'object') {
    return badRequestResponse('content (object with en/zh/ar) is required.');
  }

  try {
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) return badRequestResponse('slug already exists');

    const publishedAt =
      typeof body.publishedAt === 'string' && body.publishedAt ? new Date(body.publishedAt) : new Date();

    const created = await prisma.blogPost.create({
      data: {
        slug,
        title: body.title as object,
        excerpt: (body.excerpt as object) ?? null,
        content: body.content as object,
        author: typeof body.author === 'string' && body.author.trim() ? body.author : 'Qtech Team',
        publishedAt,
        status: typeof body.status === 'string' ? body.status : 'published',
        featured: typeof body.featured === 'boolean' ? body.featured : false,
        images: Array.isArray(body.images)
          ? (body.images as string[])
          : typeof body.image === 'string' && body.image.trim()
            ? [body.image.trim()]
            : [],
        seoTitle: (body.seoTitle as object) ?? null,
        seoKeywords: (body.seoKeywords as object) ?? null,
        // S-06: single-language SEO description (string, not JSON).
        seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : null,
        faq: Array.isArray(body.faq) ? (body.faq as object) : Prisma.DbNull,
      },
    });
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error('[admin/blogs] POST failed:', err);
    return serverErrorResponse();
  }
}
