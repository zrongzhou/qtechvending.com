import type { Metadata } from 'next';
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// Root layout is a pure pass-through. The <html>/<body> tags are rendered by
// the locale-specific layout (src/app/[locale]/layout.tsx) so that each
// locale can emit the correct `lang`/`dir` for the very first byte of HTML
// (no RTL flash, SEO-correct). This is the next-intl official App Router
// pattern. Removing the previous `headers()`-based locale resolution here is
// what unblocks ISR for the content pages (no dynamic render deadlock).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
