import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import BuildVersionChecker from '@/components/BuildVersionChecker';

export const metadata: Metadata = {
  title: {
    default: 'Qtech — Intelligent Vending & Fresh-Flower Automation Equipment',
    template: '%s | Qtech',
  },
  description:
    'Qtech (Guangzhou Qiuyan Technology) manufactures intelligent vending machines, fresh-flower vending, and automated garden equipment for global distributors and operators.',
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
    : undefined,
  // V49.22: Search engine verification — replace content values with actual
  // verification codes from Google Search Console / Bing Webmaster Tools etc.
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE_HERE',
    other: {
      'msvalidate.YOUR_BING_CODE': 'YOUR_BING_VERIFICATION_CODE_HERE',
      'yandex-verification': 'YOUR_YANDEX_VERIFICATION_CODE_HERE',
      'baidu-site-verification': 'YOUR_BAIDU_VERIFICATION_CODE_HERE',
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// Reading the middleware-injected `x-pathname` forces dynamic rendering, which
// is already the case for the data-driven pages. The locale is derived here so
// the SSR HTML carries the correct lang/dir (e.g. /ar → lang="ar" dir="rtl")
// for crawlers and for first paint (no RTL flash). Client-side locale switches
// are still handled by [locale]/layout.tsx via useEffect.
const VALID_LOCALES = ['en', 'zh', 'ar'] as const;

function resolveLocale(): { locale: string; dir: 'ltr' | 'rtl' } {
  try {
    const pathname = headers().get('x-pathname') || '';
    const seg = pathname.split('/').filter(Boolean)[0] || '';
    if ((VALID_LOCALES as readonly string[]).includes(seg)) {
      return { locale: seg, dir: seg === 'ar' ? 'rtl' : 'ltr' };
    }
  } catch {
    // headers() unavailable in some contexts — fall back to defaults.
  }
  return { locale: 'en', dir: 'ltr' };
}

/**
 * Escapes a value for safe embedding inside a single-quoted inline <script>.
 * Build IDs only contain [A-Za-z0-9-], but we still neutralise quotes and
 * backslashes to stay defensive against any future value source.
 */
function escapeForInlineScript(value: string): string {
  return value.replace(/['"\\]/g, '\\$&');
}

// Build id injected at build time via next.config.mjs `env.NEXT_PUBLIC_BUILD_ID`.
// Falls back to the deployment pipeline's GIT_COMMIT, then 'dev' for local runs
// where the value was not inlined.
const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ?? process.env.GIT_COMMIT ?? 'dev';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dir } = resolveLocale();
  // Reflects the moment this HTML response was rendered (informational only;
  // the client compares buildId, not builtAt).
  const builtAt = new Date().toISOString();
  return (
    <html lang={locale} dir={dir}>
      <body className="flex min-h-screen flex-col bg-slate-50 text-ink-800 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BUILD_ID__='${escapeForInlineScript(
              BUILD_ID,
            )}';window.__BUILT_AT__='${escapeForInlineScript(builtAt)}';`,
          }}
        />
        {children}
        <BuildVersionChecker />
      </body>
    </html>
  );
}
