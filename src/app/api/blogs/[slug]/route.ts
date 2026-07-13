import { NextRequest, NextResponse } from 'next/server';
import { getBlogBySlug } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = await getBlogBySlug(params.slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json(post);
}
