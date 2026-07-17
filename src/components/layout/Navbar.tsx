'use client';

import { useEffect, useRef, useState } from 'react';
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
  const langRef = useRef<HTMLDivElement>(null);

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

  // 点击外部关闭语言下拉 + Esc 关闭所有浮层（a11y / 体验）
  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLangOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

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
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors after:pointer-events-none after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-center after:rounded-full after:bg-gradient-to-r after:from-brand-400 after:to-brand-600 after:transition-transform after:duration-300 motion-reduce:after:transition-none ${
                isActive(item.href)
                  ? 'text-brand-700 after:scale-x-100'
                  : 'text-ink-600 after:scale-x-0 hover:text-brand-700 hover:after:scale-x-100'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1"
              aria-label={t('nav.language')}
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{locale}</span>
            </button>
            {/* 常驻挂载：淡入 + 缩放 + 上移入场，reduced-motion 下瞬显 */}
            <div
              className={`absolute end-0 z-50 mt-2 w-32 origin-top overflow-hidden rounded-md border border-slate-200 bg-white shadow-card transition-all duration-150 ease-out motion-reduce:transition-none ${
                langOpen
                  ? 'visible translate-y-0 scale-100 opacity-100'
                  : 'invisible -translate-y-1 scale-95 opacity-0'
              }`}
              role="menu"
              aria-label={t('nav.language')}
            >
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="menuitem"
                  onClick={() => switchLocale(l)}
                  className={`block w-full px-4 py-2 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 active:scale-[0.98] ${
                    l === locale ? 'font-semibold text-brand-700' : 'text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'zh' ? '中文' : 'العربية'}
                </button>
              ))}
            </div>
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
            className="inline-flex items-center justify-center rounded-md p-2 text-ink-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.closeMenu') : t('nav.toggleMenu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav —— grid-rows 高度过渡 + 淡入，实现平滑展开/收起 */}
      <div
        id="mobile-nav"
        className={`grid transition-all duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 bg-slate-50">
            <nav className="container-qtech flex flex-col py-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`rounded-md border-s-2 px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'border-brand-500 bg-white text-brand-700'
                      : 'border-transparent text-ink-700 hover:bg-white hover:text-brand-700'
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
        </div>
      </div>
    </header>
  );
}
