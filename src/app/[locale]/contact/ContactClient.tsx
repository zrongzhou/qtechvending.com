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
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import IconTile from '@/components/ui/IconTile';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SUBJECTS = ['general', 'sales', 'support', 'customization', 'partnership'] as const;

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

const SOCIALS: SocialLink[] = [
  { name: 'Facebook', href: 'https://www.facebook.com/memn.ho', icon: Facebook },
  { name: 'Twitter', href: 'https://x.com/memhou-s-21', icon: Twitter },
  { name: 'YouTube', href: 'https://www.youtube.com/@flowervending', icon: Youtube },
];

export default function ContactClient({
  categories,
  initialProductInterest = '',
}: {
  categories: Category[];
  initialProductInterest?: string;
}) {
  const { t, locale } = useLocale();
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
        <div className="mx-auto max-w-xl rounded-2xl border border-brand-200 bg-brand-50 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-ink-900">{t('contact.successTitle')}</h2>
          <p className="mt-2 text-ink-500">{t('contact.successDesc')}</p>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

  const infoRow = (Icon: LucideIcon, label: string, value: string) => (
    <li className="flex items-start gap-3">
      <IconTile icon={Icon} className="h-4 w-4" tileClassName="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-0.5 text-sm text-ink-700">{value}</p>
      </div>
    </li>
  );

  return (
    <div className="container-qtech py-12 lg:py-16">
      <RevealOnScroll>
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {t('contact.eyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink-900">{t('contact.title')}</h1>
          <p className="mt-2 text-ink-500">{t('contact.subtitle')}</p>
        </header>
      </RevealOnScroll>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <RevealOnScroll className="h-full">
          <form onSubmit={onSubmit} className="h-full space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t('contact.name')} <span className="text-red-500">*</span>
                </label>
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('contact.namePlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t('contact.email')} <span className="text-red-500">*</span>
                </label>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={t('contact.emailPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t('contact.phone')}</label>
                <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder={t('contact.phonePlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t('contact.company')}</label>
                <input className={inputCls} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder={t('contact.companyPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t('contact.country')}</label>
                <input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} placeholder={t('contact.countryPlaceholder')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">{t('contact.productInterest')}</label>
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
              <label className="mb-1.5 block text-sm font-medium text-ink-700">{t('contact.subject')}</label>
              <select className={inputCls} value={form.subject} onChange={(e) => set('subject', e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`contact.subject.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('contact.message')} <span className="text-red-500">*</span>
              </label>
              <textarea rows={5} className={inputCls} value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t('contact.messagePlaceholder')} />
            </div>

            {status === 'error' && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full px-7 py-3 text-sm disabled:opacity-60"
            >
              {status === 'submitting' ? t('contact.submitting') : t('contact.submit')}
            </button>
          </form>
        </RevealOnScroll>

        <RevealOnScroll delay={120} className="h-full">
          <aside className="space-y-6">
            {/* Contact info card */}
            <div className="pro-card p-6">
              <h2 className="text-lg font-semibold text-ink-900">{t('contact.info')}</h2>
              <ul className="mt-4 space-y-4 text-sm">
                {infoRow(MapPin, t('contact.address'), 'Zai Pier, No.131 Jintong Road, Bao long street, Panyu, Guangzhou, China')}
                <li className="flex items-start gap-3">
                  <IconTile icon={Mail} className="h-4 w-4" tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{t('contact.emailUs')}</p>
                    <a href="mailto:glvending.sabina@gmail.com" className="mt-0.5 block text-brand-700 hover:underline">glvending.sabina@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IconTile icon={Phone} className="h-4 w-4" tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{t('contact.callUs')}</p>
                    <p className="mt-0.5 text-ink-700">+86 183 1975 3992 (Anne)</p>
                    <p className="text-ink-700">+86 190 1516 9848 (Sabina)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IconTile icon={MessageCircle} className="h-4 w-4" tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">WhatsApp</p>
                    <p className="mt-0.5 text-ink-700">
                      <a href="https://wa.me/8618319753992" target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">+86 183 1975 3992</a>
                      {' / '}
                      <a href="https://wa.me/8619015169848" target="_blank" rel="noopener noreferrer" className="hover:text-brand-700">+86 190 1516 9848</a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IconTile icon={MessageSquare} className="h-4 w-4" tileClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">WeChat</p>
                    <p className="mt-0.5 text-ink-700">Qtech Vending</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map / location */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              <iframe
                title="Qtech Vending — Guangzhou"
                src="https://maps.google.com/maps?q=Zai+Pier+No.131+Jintong+Road+Bao+long+street+Panyu+Guangzhou+China&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-52 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Social media */}
            <div className="pro-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                {t('contact.connectWithUs')}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {SOCIALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="inline-flex"
                    >
                      <IconTile
                        icon={Icon}
                        className="h-5 w-5"
                        tileClassName="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white"
                      />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* FAQ quick link */}
            <Link
              href={`/${locale}/faq`}
              className="flex items-center justify-between gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
            >
              {t('contact.faqLink')}
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </aside>
        </RevealOnScroll>
      </div>
    </div>
  );
}
