'use client';

import { useState, type ReactNode } from 'react';
import type { SiteSetting, I18nString, I18nStringList, SocialLink } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, TriListInput, emptyI18n } from './I18nInputs';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

/** A titled grouping card used to organise the site-settings form into sections. */
function GroupCard({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-ink-400">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SiteSettingForm({
  initial,
  onSaved,
}: {
  initial?: SiteSetting | null;
  onSaved?: (s: SiteSetting) => void;
}) {
  const [company, setCompany] = useState<I18nString>(initial?.company ?? emptyI18n());
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [address, setAddress] = useState<I18nString | null>(initial?.address ?? null);
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? '');
  const [socials, setSocials] = useState<SocialLink[]>(initial?.socials ?? []);
  const [sameAsText, setSameAsText] = useState((initial?.sameAs ?? []).join('\n'));
  const [keywords, setKeywords] = useState<I18nStringList | null>(initial?.keywords ?? null);
  const [defaultTitle, setDefaultTitle] = useState<I18nString | null>(initial?.defaultTitle ?? null);
  const [defaultDescription, setDefaultDescription] = useState<I18nString | null>(initial?.defaultDescription ?? null);
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? '');
  const [twitterHandle, setTwitterHandle] = useState(initial?.twitterHandle ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateSocial = (idx: number, patch: Partial<SocialLink>) =>
    setSocials((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeSocial = (idx: number) => setSocials((prev) => prev.filter((_, i) => i !== idx));
  const addSocial = () => setSocials((prev) => [...prev, { name: '', href: '' }]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      company,
      email,
      phone,
      address: address ?? null,
      addressLine: addressLine.trim() || null,
      socials,
      sameAs: sameAsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      keywords: keywords ?? null,
      defaultTitle: defaultTitle ?? null,
      defaultDescription: defaultDescription ?? null,
      ogImage: ogImage.trim() || null,
      twitterHandle: twitterHandle.trim() || null,
    };
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result?.error || t('admin.saveError'));
        setSaving(false);
        return;
      }
      setSaving(false);
      onSaved?.(result?.data ?? (initial as SiteSetting));
    } catch {
      setError(t('admin.saveError'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* 公司信息 */}
      <GroupCard title={t('admin.companyInfo')} desc={t('admin.companyInfoDesc')}>
        <TriTextInput label={t('admin.fieldCompany')} value={company} onChange={setCompany} required />
        <TriTextArea label={t('admin.fieldAddress')} value={address} onChange={setAddress} />
        <div>
          <label className={labelCls}>{t('admin.fieldAddressLine')}</label>
          <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className={inputCls} />
        </div>
      </GroupCard>

      {/* 联系信息 */}
      <GroupCard title={t('admin.contactInfo')} desc={t('admin.contactInfoDesc')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('admin.fieldEmail')}</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('admin.fieldPhone')}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
        </div>
      </GroupCard>

      {/* 社交媒体 */}
      <GroupCard title={t('admin.socialMedia')} desc={t('admin.socialMediaDesc')}>
        <div>
          <label className={labelCls}>{t('admin.fieldSocials')}</label>
          <div className="space-y-2">
            {socials.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={s.name}
                  onChange={(e) => updateSocial(idx, { name: e.target.value })}
                  placeholder={t('admin.fieldName')}
                  className={inputCls}
                />
                <input
                  value={s.href}
                  onChange={(e) => updateSocial(idx, { href: e.target.value })}
                  placeholder="https://..."
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeSocial(idx)}
                  className="shrink-0 rounded-md border border-red-300 px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocial}
              className="rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              + {t('admin.addSocial')}
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('admin.fieldSameAs')}</label>
          <textarea
            rows={3}
            value={sameAsText}
            onChange={(e) => setSameAsText(e.target.value)}
            placeholder="https://facebook.com/...&#10;https://twitter.com/..."
            className={`${inputCls} resize-y`}
          />
        </div>
      </GroupCard>

      {/* SEO 默认 */}
      <GroupCard title={t('admin.seoDefaults')} desc={t('admin.seoDefaultsDesc')}>
        <TriListInput label={t('admin.fieldKeywords')} value={keywords} onChange={setKeywords} />
        <TriTextInput label={t('admin.fieldDefaultTitle')} value={defaultTitle} onChange={setDefaultTitle} />
        <TriTextArea label={t('admin.fieldDefaultDescription')} value={defaultDescription} onChange={setDefaultDescription} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t('admin.fieldOgImage')}</label>
            <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t('admin.fieldTwitterHandle')}</label>
            <input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} className={inputCls} />
          </div>
        </div>
      </GroupCard>

      {/* SSL / HTTPS management moved to the <SiteSettingsSslCerts /> component. */}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? t('common.loading') : t('admin.save')}
      </button>
    </form>
  );
}
