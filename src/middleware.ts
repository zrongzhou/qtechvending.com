import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'zh', 'ar'];

// Top-level routes that must NOT be treated as an (invalid) locale segment.
const LEGIT_TOPS = new Set([
  'xiaozhouBackend',
  'api',
  'robots.txt',
  'sitemap.xml',
  'images',
]);

// Hosts that must NEVER be force-redirected to https (local dev / test domains).
const SKIP_HTTPS_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function shouldSkipHttpsHost(host: string): boolean {
  const h = (host || '').split(':')[0].toLowerCase();
  return SKIP_HTTPS_HOSTS.has(h) || h.endsWith('.localhost');
}

/**
 * Edge-runtime middleware cannot use Prisma directly, so the HTTPS-enforcement
 * flag is read from the database through a tiny internal (node-runtime) endpoint
 * and cached in a module-level variable for 60s. This keeps the per-request cost
 * to a single in-process fetch once per minute, and fails open (no redirect) when
 * the DB / endpoint is unreachable.
 */
interface HttpsCache {
  force: boolean;
  ts: number;
}
let httpsCache: HttpsCache | null = null;
const HTTPS_CACHE_TTL = 60_000;

async function getForceHttps(request: NextRequest): Promise<boolean> {
  const now = Date.now();
  if (httpsCache && now - httpsCache.ts < HTTPS_CACHE_TTL) {
    return httpsCache.force;
  }
  try {
    // Hit the internal endpoint on the local Node server (bypasses the proxy and
    // the middleware matcher, which excludes /api/internal/…).
    const port = request.nextUrl.port || process.env.PORT || '3001';
    const base = `http://127.0.0.1:${port}`;
    const res = await fetch(`${base}/api/internal/site-settings/https`, {
      headers: { 'x-qtech-internal': '1' },
      cache: 'no-store',
    });
    if (res.ok) {
      const j = (await res.json()) as { forceHttps?: boolean };
      httpsCache = { force: !!j.forceHttps, ts: now };
      return httpsCache.force;
    }
  } catch {
    // ignore — fall back to the last cached value (or false on cold start)
  }
  return httpsCache?.force ?? false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root path → default locale /en (permanent).
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 308);
  }

  const seg = pathname.split('/').filter(Boolean)[0] || '';

  // 1b. Force HTTPS (T10): if enabled and the request arrived over plain http
  //     (behind a proxy this is signalled by x-forwarded-proto), and the host is
  //     not a local/dev host, redirect to the https equivalent (308). Localhost /
  //     127.0.0.1 are always skipped so local dev stays reachable over http.
  const host = request.headers.get('host') || '';
  if (!shouldSkipHttpsHost(host)) {
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (request.nextUrl.protocol === 'http:' ? 'http' : 'https');
    if (proto === 'http') {
      const force = await getForceHttps(request);
      if (force) {
        const url = request.nextUrl.clone();
        url.protocol = 'https:';
        if (url.port === '80') url.port = ''; // drop a leaked :80 from the proxy
        return NextResponse.redirect(url, 308);
      }
    }
  }

  // 0. Guard the admin backend behind login. The login page itself must
  //    always pass through, otherwise the redirect would loop forever.
  if (seg === 'xiaozhouBackend') {
    if (pathname === '/xiaozhouBackend/login') {
      return NextResponse.next();
    }
    const hasAuth = request.cookies.get('admin_auth');
    if (!hasAuth) {
      const url = request.nextUrl.clone();
      url.pathname = '/xiaozhouBackend/login';
      return NextResponse.redirect(url, 307);
    }
    return NextResponse.next();
  }

  // 2. First segment is not a locale and not a legit top-level route →
  //    prepend the default locale so /products -> /en/products,
  //    /blog -> /en/blog, /about -> /en/about, etc. (step 1 already
  //    handles pathname === '/', so here pathname is never just '/').
  if (seg && !VALID_LOCALES.includes(seg) && !LEGIT_TOPS.has(seg)) {
    const url = request.nextUrl.clone();
    url.pathname = '/en' + pathname;
    return NextResponse.redirect(url, 308);
  }

  // 3. Expose the current pathname to the root layout for <html lang/dir>.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 4. Locale routes pass through (inject header).
  if (seg && VALID_LOCALES.includes(seg)) {
    // Disable caching for product listing pages (frequently filtered/searched).
    if (pathname.endsWith('/products')) {
      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Exclude static assets, images and the internal HTTPS-status endpoint (the
  // latter prevents the middleware's own DB-status fetch from recursing).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/|api/internal/).*)'],
};
