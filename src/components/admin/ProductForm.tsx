'use client';

import { useEffect, useState } from 'react';
import type { Product, I18nString, I18nStringList, FaqItem, Category } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, TriListInput, emptyI18n } from './I18nInputs';
import ProductFaqEditor from './ProductFaqEditor';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

interface SpecRow {
  param: string;
  value: string;
}

export default function ProductForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Product | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [tab, setTab] = useState<'details' | 'faq'>('details');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState<I18nString>(initial?.name ?? emptyI18n());
  const [shortDescription, setShortDescription] = useState<I18nString | null>(initial?.shortDescription ?? null);
  const [description, setDescription] = useState<I18nString | null>(initial?.description ?? null);
  const [image, setImage] = useState((initial?.images?.[0]) ?? '');
  const [specs, setSpecs] = useState<SpecRow[]>(
    (initial?.specs as SpecRow[] | null) ?? []
  );
  const [seoTitle, setSeoTitle] = useState<I18nString | null>(initial?.seoTitle ?? null);
  const [seoKeywords, setSeoKeywords] = useState<I18nStringList | null>(initial?.seoKeywords ?? null);
  const [categorySlugs, setCategorySlugs] = useState<string[]>(
    initial?.categories?.map((c) => c.slug) ?? []
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [faq, setFaq] = useState<FaqItem[]>(initial?.faq ?? []);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories?limit=100', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setAllCategories(j.data || []))
      .catch(() => {});
  }, []);

  const toggleCat = (s: string) =>
    setCategorySlugs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const updateSpec = (idx: number, patch: Partial<SpecRow>) =>
    setSpecs((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeSpec = (idx: number) => setSpecs((prev) => prev.filter((_, i) => i !== idx));
  const addSpec = () => setSpecs((prev) => [...prev, { param: '', value: '' }]);

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
      name: title,
      shortDescription: shortDescription ?? null,
      description: description ?? null,
      images: image.trim() ? [image.trim()] : [],
      specs,
      seoTitle: seoTitle ?? null,
      seoKeywords: seoKeywords ?? null,
      categories: categorySlugs,
      featured,
      status,
      order: Number(order) || 0,
      faq,
    };
    try {
      const res = await fetch(initial ? `/api/admin/products/${initial.id}` : '/api/admin/products', {
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
    <form onSubmit={submit} className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('details')}
          className={`rounded-t-md px-4 py-2 text-sm font-medium ${
            tab === 'details' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {t('admin.tabDetails')}
        </button>
        <button
          type="button"
          onClick={() => setTab('faq')}
          className={`rounded-t-md px-4 py-2 text-sm font-medium ${
            tab === 'faq' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {t('admin.tabFaq')} ({faq.length})
        </button>
      </div>

      {tab === 'details' ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <label className={labelCls}>
              {t('admin.fieldSlug')} <span className="text-red-500">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="e.g. rose-vending-machine"
              disabled={!!initial}
            />
          </div>
          <TriTextInput label={t('admin.fieldTitle')} value={title} onChange={setTitle} required />
          <TriTextArea label={t('admin.fieldShortDescription')} value={shortDescription} onChange={setShortDescription} />
          <TriTextArea label={t('admin.fieldDescription')} value={description} onChange={setDescription} rows={5} />
          <div>
            <label className={labelCls}>{t('admin.fieldImage')}</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={inputCls}
              placeholder="/images/products/rose-vending/1.webp"
            />
          </div>

          {/* Specs editor */}
          <div>
            <label className={labelCls}>{t('admin.fieldSpecs')}</label>
            <div className="space-y-2">
              {specs.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={row.param}
                    onChange={(e) => updateSpec(idx, { param: e.target.value })}
                    placeholder={t('admin.fieldParam')}
                    className={inputCls}
                  />
                  <input
                    value={row.value}
                    onChange={(e) => updateSpec(idx, { value: e.target.value })}
                    placeholder={t('admin.fieldValue')}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="shrink-0 rounded-md border border-red-300 px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                + {t('admin.addSpec')}
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('admin.seoSection')}
            </p>
            <div className="space-y-4">
              <TriTextInput label={t('admin.fieldSeoTitle')} value={seoTitle} onChange={setSeoTitle} />
              <TriListInput label={t('admin.fieldSeoKeywords')} value={seoKeywords} onChange={setSeoKeywords} />
            </div>
          </div>

          {/* Categories multi-select */}
          <div>
            <label className={labelCls}>{t('admin.fieldCategories')}</label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
              {allCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={categorySlugs.includes(c.slug)}
                    onChange={() => toggleCat(c.slug)}
                  />
                  <span>{c.icon ? `${c.icon} ` : ''}{String((c.name as Record<string, string>)?.en ?? c.slug)}</span>
                </label>
              ))}
              {!allCategories.length && (
                <span className="col-span-full text-sm text-ink-400">{t('admin.noCategories')}</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>{t('admin.fieldOrder')}</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t('admin.fieldStatus')}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                <option value="active">{t('admin.statusActive')}</option>
                <option value="inactive">{t('admin.statusInactive')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                {t('admin.fieldFeatured')}
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ProductFaqEditor value={faq} onChange={setFaq} />
        </div>
      )}

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
