'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/BackToTop';
import JsonLd from '@/components/JsonLd';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LocaleProvider, Locale, locales } from '@/lib/i18n';
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';
import arMessages from '@/messages/ar.json';

const MESSAGES: Record<Locale, Record<string, string>> = {
  en: enMessages,
  zh: zhMessages,
  ar: arMessages,
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.qtechvending.com';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  const activeLocale: Locale = (locales as readonly string[]).includes(locale) ? (locale as Locale) : 'en';
  const [currentLocale, setCurrentLocale] = useState<Locale>(activeLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(activeLocale);
  }, [activeLocale]);

  // Update <html lang/dir> after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    if (!mounted) return;
    const htmlEl = document.documentElement;
    htmlEl.lang = currentLocale;
    htmlEl.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
  }, [currentLocale, mounted]);

  const messages = MESSAGES[currentLocale];

  return (
    <ErrorBoundary>
      <LocaleProvider locale={currentLocale} messages={messages}>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
              telephone: '+86 183 1975 3992',
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
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </LocaleProvider>
    </ErrorBoundary>
  );
}
