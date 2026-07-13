'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import type { Category } from '@/types';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SUBJECTS = ['general', 'sales', 'support', 'customization', 'partnership'] as const;

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

  return (
    <div className="container-qtech py-12 lg:py-16">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink-900">{t('contact.title')}</h1>
        <p className="mt-2 text-ink-500">{t('contact.subtitle')}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
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
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {status === 'submitting' ? t('contact.submitting') : t('contact.submit')}
          </button>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-ink-900">{t('contact.info')}</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-ink-500">{t('contact.address')}</dt>
              <dd className="mt-1 text-ink-700">Guangzhou, Guangdong, China</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">{t('contact.emailUs')}</dt>
              <dd className="mt-1 text-ink-700">sales@qtechvending.com</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">{t('contact.callUs')}</dt>
              <dd className="mt-1 text-ink-700">+86-20-0000-0000</dd>
            </div>
            <div>
              <dt className="font-medium text-ink-500">{t('contact.hours')}</dt>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
