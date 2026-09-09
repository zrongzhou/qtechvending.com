import { NextRequest, NextResponse } from 'next/server';
import { getBlogs } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;

  const res = await getBlogs(page, 9);
  let items = res.data;
  // Use the true published count from the data layer, NOT the sliced page length,
  // otherwise client-side navigation would collapse totalPages to 1 and hide paging.
  let total = res.total;
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    // Client-side title filter (blog volume is small).
    items = items.filter((p) => {
      const title = ((p.title as Record<string, string>)?.en || '').toLowerCase();
      return title.includes(needle);
    });
    // Re-count against the filtered set so pagination stays accurate.
    total = items.length;
  }
  // P-05: public, read-only list — edge-cache for 5 min, stale-while-revalidate 10 min.
  return NextResponse.json(
    {
      data: items,
      total,
      totalPages: Math.max(1, Math.ceil(total / 9)),
      page,
      pageSize: 9,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
