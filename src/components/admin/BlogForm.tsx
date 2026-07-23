'use client';

import { useState } from 'react';
import type { BlogPost, FaqItem, I18nString } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, emptyI18n } from './I18nInputs';
import ImagePicker from './ImagePicker';
import RichTextEditor from './RichTextEditor';
import ProductFaqEditor from './ProductFaqEditor';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

function toDateInput(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

export default function BlogForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: BlogPost | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState<I18nString>(initial?.title ?? emptyI18n());
  const [excerpt, setExcerpt] = useState<I18nString | null>(initial?.excerpt ?? null);
  const [content, setContent] = useState<I18nString>(initial?.content ?? emptyI18n());
  const [publishedAt, setPublishedAt] = useState(toDateInput(initial?.publishedAt));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [status, setStatus] = useState(initial?.status ?? 'published');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState<I18nString | null>(initial?.seoTitle ?? null);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeLang, setActiveLang] = useState<'en' | 'zh' | 'ar'>('en');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError(t('admin.slugRequired'));
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      slug: slug.trim(),
      title,
      excerpt: excerpt ?? null,
      content,
      publishedAt,
      images,
      status,
      featured,
      seoTitle: seoTitle ?? null,
      faq,
    };
    try {
      const res = await fetch(initial ? `/api/admin/blogs/${initial.id}` : '/api/admin/blogs', {
        method: initial ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || t('admin.saveError'));
        setSaving(false);
        return;
      }
      setSaving(false);
      onSaved?.();
    } catch {
      setError(t('admin.saveError'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <label className={labelCls}>
          {t('admin.fieldSlug')} <span className="text-red-500">*</span>
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputCls}
          placeholder="e.g. how-to-choose-vending-machine"
          disabled={!!initial}
        />
      </div>
      <TriTextInput label={t('admin.fieldTitle')} value={title} onChange={setTitle} required />
      <TriTextArea label={t('admin.fieldExcerpt')} value={excerpt} onChange={setExcerpt} />
      <div>
        <label className={labelCls}>{t('admin.fieldContent')}</label>
        <p className="mb-2 text-xs text-slate-400">Markdown 兼容 · 所见即所得编辑器（与现有博客内容无损互通）</p>
        <div className="mb-2 flex gap-1">
          {(['en', 'zh', 'ar'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                activeLang === lang
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <RichTextEditor
          key={activeLang}
          value={content[activeLang] ?? ''}
          onChange={(md) => setContent({ ...content, [activeLang]: md })}
          placeholder={`${t('admin.fieldContent')} (${activeLang.toUpperCase()})`}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>{t('admin.fieldPublishedAt')}</label>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t('admin.fieldStatus')}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="published">{t('admin.statusPublished')}</option>
            <option value="draft">{t('admin.statusDraft')}</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            {t('admin.fieldFeatured')}
          </label>
        </div>
      </div>
      <div>
        <ImagePicker
          value={images}
          onChange={setImages}
          type="blog"
          slug={slug}
          label={t('admin.fieldBlogImages')}
          hint={t('admin.imagesHint')}
        />
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="mb-3 text-sm font-semibold text-ink-700">常见问题 (FAQ)</p>
        <ProductFaqEditor value={faq} onChange={setFaq} />
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t('admin.seoSection')}
        </p>
        <TriTextInput label={t('admin.fieldSeoTitle')} value={seoTitle} onChange={setSeoTitle} />
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? t('common.loading') : initial ? t('admin.update') : t('admin.create')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-slate-50"
          >
            {t('admin.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
