import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dir } = resolveLocale();
  return (
    <html lang={locale} dir={dir}>
      <body className="flex min-h-screen flex-col bg-slate-50 text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}
