'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { useLocale, locales, type Locale } from '@/lib/i18n';
import Logo from '@/components/Logo';

const NAV_ITEMS = [
  { key: 'nav.home', href: '' },
  { key: 'nav.products', href: '/products' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.solutions', href: '/solutions' },
  { key: 'nav.blog', href: '/blog' },
  { key: 'nav.faq', href: '/faq' },
  { key: 'nav.contact', href: '/contact' },
];

export default function Navbar() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (next: Locale) => {
    setLangOpen(false);
    const segments = pathname.split('/');
    // segments[0] = '' ; segments[1] = current locale
    segments[1] = next;
    router.push(segments.join('/') || `/${next}`);
  };

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    if (href === '') return pathname === full;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container-qtech flex h-16 items-center justify-between">
        {/* Brand logo — 两列布局: 左列=菱形星标+Qtech/TOOL CABINET, 右列=公司全名 */}
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="Qtech home">
          <Logo size={26} />
          <span
            className="hidden sm:inline text-slate-900 font-bold leading-snug"
            style={{ fontSize: '15px', maxWidth: '180px' }}
          >
            Guangzhou Qiuyan Technology Co., Ltd.
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? 'text-brand-600'
                  : 'text-ink-600 hover:text-brand-600'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-2 text-sm font-medium text-ink-700 hover:bg-slate-50"
              aria-label={t('nav.language')}
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
            </button>
            {langOpen && (
              <div className="absolute end-0 mt-2 w-32 overflow-hidden rounded-md border border-slate-200 bg-white shadow-card">
                {locales.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => switchLocale(l)}
                    className={`block w-full px-4 py-2 text-start text-sm hover:bg-slate-50 ${
                      l === locale ? 'font-semibold text-brand-600' : 'text-ink-700'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'zh' ? '中文' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/${locale}/contact`}
            className="hidden btn-primary px-4 py-2 text-sm sm:inline-flex"
          >
            {t('nav.getQuote')}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-ink-700 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.closeMenu') : t('nav.toggleMenu')}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-slate-200 bg-slate-50 md:hidden">
          <nav className="container-qtech flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-medium ${
                  isActive(item.href) ? 'text-brand-600' : 'text-ink-700'
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 px-4 py-3 text-center text-sm"
            >
              {t('nav.getQuote')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
