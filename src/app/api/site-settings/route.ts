import { NextRequest, NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/data';

/**
 * Public (unauthenticated) endpoint returning the resolved SiteSetting.
 * Used by client components (Footer, layout Organization JSON-LD) that cannot
 * read the database directly. Degrades to SITE_CONFIG when the DB is empty.
 */
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const setting = await getSiteSetting();
    return NextResponse.json({ data: setting });
  } catch (err) {
    console.error('[site-settings] GET failed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
