import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await getCategories();
  // P-05: public, read-only list — edge-cache for 5 min, stale-while-revalidate 10 min.
  return NextResponse.json(categories, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
