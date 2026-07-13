import { NextRequest, NextResponse } from 'next/server';
import { getBlogs } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  let items = (await getBlogs(page, 9)).data;
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    // Client-side title filter (blog volume is small).
    items = items.filter((p) => {
      const title = ((p.title as Record<string, string>)?.en || '').toLowerCase();
      return title.includes(needle);
    });
  }
  const total = items.length;
  return NextResponse.json({
    data: items,
    total,
    totalPages: Math.max(1, Math.ceil(total / 9)),
    page,
    pageSize: 9,
  });
}
