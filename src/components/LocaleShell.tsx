'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/BackToTop';
import JsonLd from '@/components/JsonLd';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LocaleProvider, type Locale } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtechvending.com';

interface LocaleShellProps {
  locale: Locale;
  initialMessages: Record<string, string>;
  children: ReactNode;
}

/**
 * Client shell that wraps every [locale] page. It owns:
 *  - the LocaleProvider (with the server-loaded messages for the active locale)
 *  - the web-font <link> tags and the WebSite / Organization JSON-LD blocks
 *  - the shared chrome (Navbar / <main> / Footer / BackToTop)
 *  - a post-mount effect that keeps <html lang/dir> in sync with the active
 *    locale (no SSR hydration mismatch, no RTL flash on /ar)
 *
 * T06 moved this responsibility out of the (now Server Component) [locale]
 * layout so that layout can render <html>/<body> with the correct lang/dir at
 * the server. T07 added `loadMessagesOnSwitch` for the rare in-place locale
 * switch: it dynamically imports the new locale's messages and shows a neutral
 * skeleton (never English copy) while loading.
 */
export default function LocaleShell({
  locale,
  initialMessages,
  children,
}: LocaleShellProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Re-sync when the server renders a new locale (URL-based navigation).
  useEffect(() => {
    setMounted(true);
    setCurrentLocale(locale);
    setMessages(initialMessages);
  }, [locale, initialMessages]);

  // Update <html lang/dir> after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    if (!mounted) return;
    const htmlEl = document.documentElement;
    htmlEl.lang = currentLocale;
    htmlEl.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
  }, [currentLocale, mounted]);

  // Client-side locale switch (rare; URL-style switches navigate → the server
  // re-renders with the new locale's messages). Used only for in-place switches
  // where navigation is not possible. Shows a neutral skeleton, never English.
  async function loadMessagesOnSwitch(next: Locale): Promise<void> {
    if (next === currentLocale) return;
    setLoading(true);
    try {
      const mod = (await import(
        `@/messages/${next}.json`
      )) as { default: Record<string, string> };
      setMessages(mod.default);
      setCurrentLocale(next);
    } catch {
      // Keep the current messages on failure — never flash broken copy.
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErrorBoundary>
      <LocaleProvider locale={currentLocale} messages={messages}>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* V49.21: refined web-font stack (Inter for Latin, Noto Sans SC for
            Chinese, Noto Sans Arabic for Arabic) — replaces the blunt OS-default
            system-ui so headings/body read as a premium, calm typeface instead
            of a heavy blocky system bold. Runtime-loaded via <link> (no build
            dependency); display=swap avoids invisible-text flash. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* P-02: load the web fonts without blocking first paint. The sheet is
            fetched as a `print` stylesheet (non-render-blocking) and promoted to
            `all` once it finishes loading. <noscript> keeps fonts working when
            JS is disabled. Font URLs and CSS class names are unchanged. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          media="print"
          onLoad={(e) => {
            e.currentTarget.media = 'all';
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          />
        </noscript>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Qtech',
            url: BASE_URL,
            description:
              'Qtech (Guangzhou Qiuyan Technology) manufactures intelligent vending machines, fresh-flower vending, and automated garden equipment.',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${BASE_URL}/en/products?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Guangzhou Qiuyan Technology Co., Ltd.',
            alternateName: ['广州秋彦科技有限公司', 'Qtech', 'Qiuyan Technology'],
            url: BASE_URL,
            logo: `${BASE_URL}/images/logo.svg`,
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: ['+86 183 1975 3992', '+86 190 1516 9848'],
              contactType: 'sales',
              email: 'info@qtechvending.com',
              availableLanguage: ['English', 'Chinese', 'Arabic'],
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Guangzhou',
              addressRegion: 'Guangdong',
              addressCountry: 'CN',
            },
          }}
        />
        <Navbar />
        <main className="flex-1">
          {loading ? (
            <div className="flex-1" aria-hidden="true" />
          ) : (
            children
          )}
        </main>
        <Footer />
        <BackToTop />
      </LocaleProvider>
    </ErrorBoundary>
  );
}
