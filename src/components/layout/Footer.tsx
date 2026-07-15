'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import Logo from '@/components/Logo';
import WaveDivider from '@/components/common/WaveDivider';

const YEAR = new Date().getFullYear();

const FOOTER_SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/qtechvending', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/qtechvending', icon: Instagram },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/qtechvending', icon: Linkedin },
  { name: 'YouTube', href: 'https://www.youtube.com/@qtechvending', icon: Youtube },
  { name: 'Twitter', href: 'https://twitter.com/qtechvending', icon: Twitter },
];

export default function Footer() {
  const { t, locale } = useLocale();
  const base = `/${locale}`;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-ink-900 text-slate-300">
      {/* Deep-ocean wave bridging the previous (light) section into the footer */}
      <WaveDivider color="#0f172a" />

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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-coral-400 hover:bg-coral-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            {t('footer.quickLinks')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href={`${base}`} className="hover:text-coral-400">{t('nav.home')}</Link></li>
            <li><Link href={`${base}/products`} className="hover:text-coral-400">{t('nav.products')}</Link></li>
            <li><Link href={`${base}/about`} className="hover:text-coral-400">{t('nav.about')}</Link></li>
            <li><Link href={`${base}/solutions`} className="hover:text-coral-400">{t('nav.solutions')}</Link></li>
            <li><Link href={`${base}/blog`} className="hover:text-coral-400">{t('nav.blog')}</Link></li>
            <li><Link href={`${base}/faq`} className="hover:text-coral-400">{t('nav.faq')}</Link></li>
            <li><Link href={`${base}/contact`} className="hover:text-coral-400">{t('nav.contact')}</Link></li>
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
            className="btn-sunset mt-4 px-5 py-2.5 text-sm"
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
