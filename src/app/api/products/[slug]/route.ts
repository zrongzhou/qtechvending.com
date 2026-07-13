import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}
