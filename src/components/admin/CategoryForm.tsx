'use client';

import { useState } from 'react';
import type { Category, I18nString } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, emptyI18n } from './I18nInputs';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';

export default function CategoryForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Category | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [name, setName] = useState<I18nString>(initial?.name ?? emptyI18n());
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [description, setDescription] = useState<I18nString | null>(initial?.description ?? null);
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [type, setType] = useState(initial?.type ?? 'product');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      name,
      icon: icon.trim() || null,
      description: description ?? null,
      order: Number(order) || 0,
      status,
      type,
    };
    try {
      const res = await fetch(initial ? `/api/admin/categories/${initial.id}` : '/api/admin/categories', {
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {t('admin.fieldSlug')} <span className="text-red-500">*</span>
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputCls}
          placeholder="e.g. flower-vending"
          disabled={!!initial}
        />
      </div>
      <TriTextInput label={t('admin.fieldName')} value={name} onChange={setName} required />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.fieldIcon')}</label>
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className={inputCls}
          placeholder="🌸"
        />
      </div>
      <TriTextArea label={t('admin.fieldDescription')} value={description} onChange={setDescription} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.fieldOrder')}</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.fieldStatus')}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="active">{t('admin.statusActive')}</option>
            <option value="inactive">{t('admin.statusInactive')}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.fieldType')}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="product">{t('admin.typeProduct')}</option>
            <option value="solution">{t('admin.typeSolution')}</option>
            <option value="page">{t('admin.typePage')}</option>
          </select>
        </div>
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
