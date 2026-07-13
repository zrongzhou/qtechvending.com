'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import Logo from '@/components/Logo';

const YEAR = new Date().getFullYear();

export default function Footer() {
  const { t, locale } = useLocale();
  const base = `/${locale}`;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-ink-900 text-slate-300">
      <div className="container-qtech grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo textClassName="text-white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            {t('footer.tagline')}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.quickLinks')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href={`${base}`} className="hover:text-brand-300">{t('nav.home')}</Link></li>
            <li><Link href={`${base}/products`} className="hover:text-brand-300">{t('nav.products')}</Link></li>
            <li><Link href={`${base}/blog`} className="hover:text-brand-300">{t('nav.blog')}</Link></li>
            <li><Link href={`${base}/about`} className="hover:text-brand-300">{t('nav.about')}</Link></li>
            <li><Link href={`${base}/contact`} className="hover:text-brand-300">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.contact')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>{t('contact.emailUs')}: sales@qtechvending.com</li>
            <li>{t('contact.callUs')}: +86-20-0000-0000</li>
            <li>Guangzhou, Guangdong, China</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.getQuote')}
          </h3>
          <p className="mt-4 text-sm text-slate-400">{t('contact.subtitle')}</p>
          <Link
            href={`${base}/contact`}
            className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
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
