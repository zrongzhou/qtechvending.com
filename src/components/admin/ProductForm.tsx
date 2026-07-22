'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Product, I18nString, I18nStringList, FaqItem, Category } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, TriListInput, emptyI18n } from './I18nInputs';
import ProductFaqEditor from './ProductFaqEditor';
import ImageListEditor from './ImageListEditor';
import FeaturesEditor from './FeaturesEditor';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

interface SpecRow {
  param: string;
  value: string;
}

/** A titled grouping card used to organise the product form into sections. */
function GroupCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
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
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [title, setTitle] = useState<I18nString>(initial?.name ?? emptyI18n());
  const [shortDescription, setShortDescription] = useState<I18nString | null>(initial?.shortDescription ?? null);
  const [description, setDescription] = useState<I18nString | null>(initial?.description ?? null);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [features, setFeatures] = useState<I18nStringList | null>(initial?.features ?? null);
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
  const [catSearch, setCatSearch] = useState('');
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

  const filteredCats = allCategories.filter((c) => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return true;
    const name = String((c.name as Record<string, string>)?.en ?? c.slug).toLowerCase();
    return name.includes(q) || c.slug.toLowerCase().includes(q);
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError(t('admin.slugRequired'));
      return;
    }
    if (!sku.trim()) {
      setError(t('admin.skuRequired'));
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      slug: slug.trim(),
      sku: sku.trim(),
      name: title,
      shortDescription: shortDescription ?? null,
      description: description ?? null,
      images,
      features: features ?? null,
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
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* 基础信息 */}
      <GroupCard title={t('admin.basicInfo')}>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div>
            <label className={labelCls}>
              {t('admin.fieldSku')} <span className="text-red-500">*</span>
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={inputCls}
              placeholder="e.g. RV-001"
              disabled={!!initial}
            />
          </div>
        </div>

        {/* Categories multi-select (searchable two-column checkbox cards). */}
        <div>
          <label className={labelCls}>{t('admin.fieldCategories')}</label>
          <input
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder={t('admin.search')}
            className={inputCls}
          />
          <div className="mt-2 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
            {filteredCats.map((c) => {
              const checked = categorySlugs.includes(c.slug);
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    checked
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-ink-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCat(c.slug)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="truncate">
                    {c.icon ? `${c.icon} ` : ''}
                    {String((c.name as Record<string, string>)?.en ?? c.slug)}
                  </span>
                </label>
              );
            })}
            {!filteredCats.length && (
              <span className="col-span-full text-sm text-ink-400">{t('admin.noCategories')}</span>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{t('admin.fieldStatus')}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="active">{t('admin.statusActive')}</option>
              <option value="inactive">{t('admin.statusInactive')}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('admin.fieldOrder')}</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className={inputCls}
            />
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
      </GroupCard>

      {/* 多语言内容 */}
      <GroupCard title={t('admin.content')}>
        <TriTextInput label={t('admin.fieldTitle')} value={title} onChange={setTitle} required />
        <TriTextArea label={t('admin.fieldShortDescription')} value={shortDescription} onChange={setShortDescription} />
        <TriTextArea label={t('admin.fieldDescription')} value={description} onChange={setDescription} rows={5} />
      </GroupCard>

      {/* 媒体（多图） */}
      <GroupCard title={t('admin.media')}>
        <ImageListEditor
          value={images}
          onChange={setImages}
          label={t('admin.fieldImages')}
          hint={t('admin.imagesHint')}
        />
      </GroupCard>

      {/* 核心卖点（三语 features） */}
      <GroupCard title={t('admin.fieldFeatures')}>
        <FeaturesEditor value={features ?? { en: [], zh: [], ar: [] }} onChange={setFeatures} />
        <p className="mt-2 text-xs text-ink-400">{t('admin.featuresHint')}</p>
      </GroupCard>

      {/* 规格参数 */}
      <GroupCard title={t('admin.specifications')}>
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
      </GroupCard>

      {/* SEO */}
      <GroupCard title={t('admin.seo')}>
        <TriTextInput label={t('admin.fieldSeoTitle')} value={seoTitle} onChange={setSeoTitle} />
        <TriListInput label={t('admin.fieldSeoKeywords')} value={seoKeywords} onChange={setSeoKeywords} />
      </GroupCard>

      {/* FAQ */}
      <GroupCard title={t('admin.faq')}>
        <ProductFaqEditor value={faq} onChange={setFaq} />
      </GroupCard>

      {/* Sticky action bar. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
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
