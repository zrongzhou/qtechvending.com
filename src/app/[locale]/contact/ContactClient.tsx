'use client';

import { useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Facebook,
  Youtube,
  Twitter,
  Music2,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category, SiteSetting } from '@/types';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SUBJECTS = ['general', 'sales', 'support', 'customization', 'partnership'] as const;

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Tile (container) classes — controls idle + hover colours & shape. */
  tileClassName: string;
  /** Icon (svg) classes — controls icon size. */
  iconClassName: string;
}

/* V50.1: each platform shows its official brand colour at ALL times — idle =
   brand-colour tile + white glyph + matching glow; hover = brighter glow + lift.
   This pops against the dark contact glass and reads as a recognisable row. */
const SOCIALS: SocialLink[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/merin.zhou.7',
    icon: Facebook,
      tileClassName:
        'flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white ring-1 ring-black/5 shadow-[0_0_16px_rgba(24,119,242,0.5)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(24,119,242,0.9)] hover:-translate-y-0.5',
    iconClassName: 'h-5 w-5',
  },
  {
    name: 'Twitter',
    href: 'https://x.com/merinzhou?s=21',
    icon: Twitter,
      tileClassName:
        'flex h-10 w-10 items-center justify-center rounded-full bg-[#0F1419] text-white ring-1 ring-black/10 shadow-[0_0_16px_rgba(255,255,255,0.18)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(15,20,25,0.95)] hover:-translate-y-0.5',
    iconClassName: 'h-5 w-5',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@Qtechvending-VD',
    icon: Youtube,
      tileClassName:
        'flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white ring-1 ring-black/5 shadow-[0_0_16px_rgba(255,0,0,0.5)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(255,0,0,0.9)] hover:-translate-y-0.5',
    iconClassName: 'h-5 w-5',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@qtechvending',
    icon: Music2,
      tileClassName:
        'flex h-10 w-10 items-center justify-center rounded-full bg-[#000000] text-white ring-1 ring-black/10 shadow-[0_0_16px_rgba(255,255,255,0.18)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(0,0,0,0.9)] hover:-translate-y-0.5',
    iconClassName: 'h-5 w-5',
  },
];

export default function ContactClient({
  categories,
  site,
  initialProductInterest = '',
}: {
  categories: Category[];
  site: SiteSetting;
  initialProductInterest?: string;
}) {
  const { t, locale } = useLocale();

  // Contact details now come from SiteSetting (DB) instead of hardcoded SITE_CONFIG.
  const contactEmail = site?.email || 'info@qtechvending.com';
  const contactAddress =
    (site?.address ? localized(site.address, locale) : '') ||
    t('company.address');
  const contactPhone = site?.phone || '+86 183 1975 3992';
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    productInterest: initialProductInterest,
    subject: 'sales' as (typeof SUBJECTS)[number],
    message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): string | null => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return t('contact.errorRequired');
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      return t('contact.errorEmail');
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({
          name: '', email: '', phone: '', company: '', country: '',
          productInterest: '', subject: 'sales', message: '',
        });
      } else if (res.status === 400) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg(json.error || t('contact.errorGeneric'));
        setStatus('error');
      } else {
        setErrorMsg(t('contact.errorGeneric'));
        setStatus('error');
      }
    } catch {
      setErrorMsg(t('contact.errorGeneric'));
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="container-qtech py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/70 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(8,145,178,0.12)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/40">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-ink-900">{t('contact.successTitle')}</h2>
          <p className="mt-2 text-slate-600">{t('contact.successDesc')}</p>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-ink-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 focus:shadow-[0_0_0_4px_rgba(6,182,212,0.12)] [&>option]:bg-white [&>option]:text-ink-900';

  const infoRow = (Icon: LucideIcon, label: string, value: string) => (
    <li className="flex items-start gap-3">
      <IconTile
        icon={Icon}
        className="h-4 w-4"
        tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 text-white shadow-lg shadow-cyan-500/30"
      />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm text-slate-700">{value}</p>
      </div>
    </li>
  );

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-cyan-50/80 to-teal-50/60">
    <div className="container-qtech relative overflow-hidden py-12 lg:py-16">
      {/* V50.2: bright, airy brand atmosphere — large soft cyan/teal orbs over a light background. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* subtle brand grid for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.10)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute -top-24 start-0 h-80 w-80 rounded-full bg-cyan-400/45 blur-3xl" />
        <div className="absolute top-1/3 end-0 h-96 w-96 rounded-full bg-teal-400/40 blur-3xl" />
        <div className="absolute bottom-0 start-1/4 h-80 w-80 rounded-full bg-cyan-500/35 blur-3xl" />
        <div className="absolute top-2/3 end-1/3 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      </div>
      <RevealOnScroll>
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
            {t('contact.eyebrow')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{t('contact.title')}</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-600">{t('contact.subtitle')}</p>
        </header>
      </RevealOnScroll>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <RevealOnScroll className="h-full">
          <form onSubmit={onSubmit} className="relative h-full space-y-5 overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(8,145,178,0.10),inset_0_1px_0_rgba(255,255,255,0.90)] backdrop-blur-xl sm:p-10">
            <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-cyan-400 to-teal-600" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('contact.name')} <span className="text-red-500">*</span>
                </label>
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('contact.namePlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('contact.email')} <span className="text-red-500">*</span>
                </label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={t('contact.emailPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('contact.phone')}</label>
                <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t('contact.phonePlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('contact.company')}</label>
                <input className={inputCls} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder={t('contact.companyPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('contact.country')}</label>
                <input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} placeholder={t('contact.countryPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('contact.productInterest')}</label>
                <select className={inputCls} value={form.productInterest} onChange={(e) => set('productInterest', e.target.value)}>
                  <option value="">{t('contact.productInterestPlaceholder')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {localized(c.name, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('contact.subject')}</label>
              <select className={inputCls} value={form.subject} onChange={(e) => set('subject', e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`contact.subject.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('contact.message')} <span className="text-red-500">*</span>
              </label>
              <textarea rows={5} className={inputCls} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t('contact.messagePlaceholder')} />
            </div>

            {status === 'error' && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full px-7 py-3 text-sm shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {status === 'submitting' ? t('contact.submitting') : t('contact.submit')}
            </button>
          </form>
        </RevealOnScroll>

        <RevealOnScroll delay={120} className="h-full">
          <aside className="space-y-6">
            {/* Contact info card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_44px_rgba(8,145,178,0.10),inset_0_1px_0_rgba(255,255,255,0.90)] backdrop-blur-xl">
              <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-cyan-400 to-teal-600" />
              <h2 className="text-lg font-semibold text-ink-900">{t('contact.info')}</h2>
              <ul className="mt-4 space-y-4 text-sm">
                {infoRow(MapPin, t('contact.address'), contactAddress)}
                <li className="flex items-start gap-3">
                  <IconTile
                    icon={Mail}
                    className="h-4 w-4"
                    tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 text-white shadow-lg shadow-cyan-500/30"
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('contact.emailUs')}</p>
                    <a href={`mailto:${contactEmail}`} className="mt-0.5 block text-cyan-700 hover:text-cyan-600 hover:underline">{contactEmail}</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IconTile
                    icon={Phone}
                    className="h-4 w-4"
                    tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 text-white shadow-lg shadow-cyan-500/30"
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('contact.callUs')}</p>
                    <p className="mt-0.5 text-slate-700">{contactPhone}</p>
                  </div>
                </li>
                {/* WhatsApp & WeChat removed per user request */}
              </ul>
            </div>

            {/* Map / location */}
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_44px_rgba(8,145,178,0.10),inset_0_1px_0_rgba(255,255,255,0.90)] backdrop-blur-xl">
              <iframe
                title="Qtech Vending — Guangzhou"
                src="https://maps.google.com/maps?q=Room+1716-928+17F+Building+4+No.+388+Hanxi+Avenue+East+Nancun+Town+Panyu+District+Guangzhou+Guangdong+China&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-52 w-full rounded-xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Social media — V49.12: cyan/teal brand theme (matches blog/FAQ),
                unified with the rest of the site's calm brand family. */}
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_44px_rgba(8,145,178,0.10),inset_0_1px_0_rgba(255,255,255,0.90)] backdrop-blur-xl">
              <span className="absolute inset-x-0 top-0 z-20 h-1 bg-gradient-to-r from-cyan-400 to-teal-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t('contact.connectWithUs')}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
                  >
                    <IconTile icon={s.icon} className={s.iconClassName} tileClassName={s.tileClassName} />
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ quick link */}
            <Link
              href={`/${locale}/faq`}
              className="group flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 px-5 py-4 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-teal-500 hover:shadow-cyan-400/40 hover:-translate-y-0.5"
            >
              {t('contact.faqLink')}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">→</span>
            </Link>
          </aside>
        </RevealOnScroll>
      </div>
    </div>
    </div>
  );
}
