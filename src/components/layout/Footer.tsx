'use client';

import Link from 'next/link';
import { Facebook, Youtube, Twitter } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import Logo from '@/components/Logo';
import IconTile from '@/components/ui/IconTile';

const YEAR = new Date().getFullYear();

const FOOTER_SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/merin.zhou.7', icon: Facebook },
  { name: 'Twitter', href: 'https://x.com/merinzhou?s=21', icon: Twitter },
  { name: 'YouTube', href: 'https://www.youtube.com/@flowervending-VD', icon: Youtube },
];

export default function Footer() {
  const { t, locale } = useLocale();
  const base = `/${locale}`;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-ink-900 text-slate-300">
      <div className="container-qtech grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo textClassName="text-white" subTextColor="#bfdbfe" />
            <span
              className="text-slate-100 font-bold leading-snug"
              style={{ fontSize: '15px', maxWidth: '200px' }}
            >
              Guangzhou Qiuyan Technology Co., Ltd.
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            {t('footer.tagline')}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {FOOTER_SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-brand-400 hover:bg-brand-600 hover:text-white"
                >
                  <IconTile icon={Icon} className="h-4 w-4" tileClassName="" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.quickLinks')}
          </h3>
          <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" aria-hidden />
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href={`${base}`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.home')}</Link></li>
            <li><Link href={`${base}/products`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.products')}</Link></li>
            <li><Link href={`${base}/about`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.about')}</Link></li>
            <li><Link href={`${base}/solutions`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.solutions')}</Link></li>
            <li><Link href={`${base}/blog`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.blog')}</Link></li>
            <li><Link href={`${base}/faq`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.faq')}</Link></li>
            <li><Link href={`${base}/contact`} className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-brand-400 motion-reduce:transition-none rtl:hover:-translate-x-1">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.contact')}
          </h3>
          <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" aria-hidden />
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>{t('contact.emailUs')}: glvending.sabina@gmail.com</li>
            <li>{t('contact.callUs')}: +86 183 1975 3992 / +86 190 1516 9848</li>
            <li>2nd Floor No. 131, Jinlong Road, Dalong street, Panyu, Guangzhou, China</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.getQuote')}
          </h3>
          <span className="mt-2 block h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" aria-hidden />
          <p className="mt-4 text-sm text-slate-400">{t('contact.subtitle')}</p>
          <Link
            href={`${base}/contact`}
            className="btn-primary mt-4 px-5 py-2.5 text-sm"
          >
            {t('nav.getQuote')}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-qtech flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>{t('footer.copyright').replace('{year}', String(YEAR))}</p>
          <p>{t('footer.allRights')}</p>
        </div>
      </div>
    </footer>
  );
}
