'use client';

import Link from 'next/link';
import { Facebook, Youtube, Twitter, Music2, Mail, Phone, MapPin } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import Logo from '@/components/Logo';
import IconTile from '@/components/ui/IconTile';

const YEAR = new Date().getFullYear();

const FOOTER_SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/merin.zhou.7', icon: Facebook },
  { name: 'Twitter', href: 'https://x.com/merinzhou?s=21', icon: Twitter },
  { name: 'YouTube', href: 'https://www.youtube.com/@Qtechvending-VD', icon: Youtube },
  { name: 'TikTok', href: 'https://www.tiktok.com/@qtechvending', icon: Music2 },
];

export default function Footer() {
  const { t, locale } = useLocale();
  const base = `/${locale}`;

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-200 bg-ink-900 text-slate-300">
      {/* V49: Firefly ambient glow layer — magical night atmosphere */}
      <div className="footer-fireflies" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`footer-firefly footer-firefly--${i + 1}`} />
        ))}
      </div>

      {/* Main content — sits above fireflies */}
      <div className="relative z-10">
        <div className="container-qtech grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <Logo textClassName="text-white" subTextColor="#bfdbfe" />
              <span
                className="text-slate-100 font-bold leading-snug"
                style={{ fontSize: '15px', maxWidth: '200px' }}
              >
                Guangzhou Qiuyan Technology Co., Ltd.
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
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

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              {t('footer.quickLinks')}
            </h3>
            <span className="mt-3 block h-0.5 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" aria-hidden />
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <li><Link href={`${base}`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.home')}</Link></li>
              <li><Link href={`${base}/products`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.products')}</Link></li>
              <li><Link href={`${base}/about`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.about')}</Link></li>
              <li><Link href={`${base}/solutions`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.solutions')}</Link></li>
              <li><Link href={`${base}/blog`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.blog')}</Link></li>
              <li><Link href={`${base}/faq`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.faq')}</Link></li>
              <li><Link href={`${base}/contact`} className="transition-colors duration-200 hover:text-cyan-400">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info — cleaner layout with icons */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              {t('footer.contact')}
            </h3>
            <span className="mt-3 block h-0.5 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" aria-hidden />
            <ul className="mt-5 space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/70" />
                <a href="mailto:info@qtechvending.com" className="hover:text-cyan-300 transition-colors">info@qtechvending.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/70" />
                <span className="flex flex-col gap-0.5">
                  <span>+86 183 1975 3992</span>
                  <span>+86 190 1516 9848</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/70" />
                <span>{t('company.address')}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: CTA */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              {t('footer.getQuote')}
            </h3>
            <span className="mt-3 block h-0.5 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" aria-hidden />
            <p className="mt-5 text-sm leading-relaxed text-slate-400">{t('contact.subtitle')}</p>
            <Link
              href={`${base}/contact`}
              className="btn-primary mt-5 inline-flex px-6 py-2.5 text-sm"
            >
              {t('nav.getQuote')}
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container-qtech flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
            <p>{t('footer.copyright').replace('{year}', String(YEAR))}</p>
            <p>{t('footer.allRights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
