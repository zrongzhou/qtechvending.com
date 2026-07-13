'use client';

import { createContext, useContext, ReactNode } from 'react';

export const locales = ['en', 'zh', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const LocaleContext = createContext<{
  locale: Locale;
  t: (key: string) => string;
}>({
  locale: 'en',
  t: (key: string) => key,
});

interface LocaleProviderProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, string>;
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  const t = (key: string): string => {
    // 1) Direct (flat dot-notation) lookup — e.g. "home.hero.title"
    const direct = messages[key];
    if (direct !== undefined && direct !== null) return direct;

    // 2) Nested traversal fallback (e.g. { home: { hero: { title: "..." } } })
    const parts = key.split('.');
    let value: unknown = messages;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        // 3) Fall back to English equivalent for non-English locales.
        if (locale !== 'en') {
          // handled by caller's message selection; here we just return the key.
        }
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
