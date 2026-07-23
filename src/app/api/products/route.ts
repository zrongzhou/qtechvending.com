import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get('category');
  const categories = categoryParam
    ? categoryParam.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const search = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const sortParam = searchParams.get('sort') || 'featured';
  const sort = (['featured', 'newest', 'name'] as const).includes(sortParam as never)
    ? (sortParam as 'featured' | 'newest' | 'name')
    : 'featured';

  const data = await getProducts({ categories, search, page, sort });
  // P-05: public, read-only list — let the CDN/edge cache it for 5 min while
  // serving stale content for up to 10 min during revalidation.
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
