import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Internal-only endpoint that returns the `forceHttps` flag of the single
 * SiteSetting row. It exists so that the Edge-runtime middleware (which cannot
 * use Prisma directly) can read the HTTPS-enforcement decision from the
 * database without a per-request DB connection.
 *
 * Access is restricted to localhost or callers that present the internal
 * `x-qtech-internal` header (set by the middleware itself). The flag is
 * non-sensitive, so a misconfiguration only ever leaks a boolean.
 */
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const internalHeader = req.headers.get('x-qtech-internal');
  const isLocal =
    host.startsWith('127.0.0.1') || host.startsWith('localhost') || host.startsWith('::1');
  if (internalHeader !== '1' && !isLocal) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { slug: 'main' },
      select: { forceHttps: true },
    });
    return NextResponse.json({ forceHttps: setting?.forceHttps ?? false });
  } catch (err) {
    console.error('[internal/site-settings/https] failed:', err);
    // Fail open: if the DB is unreachable, do not force a redirect loop.
    return NextResponse.json({ forceHttps: false });
  }
}
