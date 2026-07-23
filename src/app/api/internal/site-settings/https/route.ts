import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SslCert } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Internal-only endpoint returning the HTTPS-enforcement decision for the Edge
 * middleware: `forceHttps` (global switch) plus `enabledDomains` (the list of
 * domains that currently have an enabled SSL certificate). The middleware
 * redirects http→https only when `forceHttps && host ∈ enabledDomains`.
 *
 * Access is restricted to localhost or callers presenting the internal
 * `x-qtech-internal` header (set by the middleware itself). These values are
 * non-sensitive, so a misconfiguration only ever leaks a boolean + domain list.
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
      select: { forceHttps: true, sslCerts: true },
    });
    const certs = (setting?.sslCerts as SslCert[] | null) ?? [];
    const enabledDomains = certs.filter((c) => c && c.enabled).map((c) => c.domain);
    return NextResponse.json({
      forceHttps: setting?.forceHttps ?? false,
      enabledDomains,
    });
  } catch (err) {
    console.error('[internal/site-settings/https] failed:', err);
    // Fail open: if the DB is unreachable, do not force a redirect loop.
    return NextResponse.json({ forceHttps: false, enabledDomains: [] });
  }
}
