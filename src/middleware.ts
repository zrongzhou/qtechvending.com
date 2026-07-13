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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root path → default locale /en (permanent).
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 308);
  }

  const seg = pathname.split('/').filter(Boolean)[0] || '';

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
