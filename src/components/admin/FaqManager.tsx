'use client';

import { useEffect, useState } from 'react';
import type { SiteFaqCategory, SiteFaqItem, I18nString } from '@/types';
import { t } from './i18n';
import { TriTextInput, TriTextArea, emptyI18n } from './I18nInputs';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

const firstText = (f?: I18nString | null): string => (f ? f.en || f.zh || f.ar || '' : '');

export default function FaqManager() {
  const [cats, setCats] = useState<SiteFaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // add-category draft
  const [newKey, setNewKey] = useState('');
  const [newTitle, setNewTitle] = useState<I18nString>(emptyI18n());
  const [newOrder, setNewOrder] = useState(0);

  // editing state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faq-categories', { credentials: 'include' });
      if (res.ok) {
        const j = await res.json();
        setCats(j.data || []);
      }
    } catch {
      /* keep */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCategory = async () => {
    if (!newKey.trim()) {
      setError(t('admin.keyRequired'));
      return;
    }
    setError('');
    const res = await fetch('/api/admin/faq-categories', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newKey.trim(), title: newTitle, faqOrder: Number(newOrder) || 0 }),
    });
    if (res.ok) {
      setNewKey('');
      setNewTitle(emptyI18n());
      setNewOrder(0);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || t('admin.saveError'));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/faq-categories/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) load();
  };

  const updateCategory = async (id: string, patch: { key?: string; title?: I18nString; faqOrder?: number }) => {
    const res = await fetch(`/api/admin/faq-categories/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setEditingCatId(null);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || t('admin.saveError'));
    }
  };

  const addItem = async (catId: string, item: { question: I18nString; answer: I18nString; faqOrder: number }) => {
    const res = await fetch('/api/admin/faq-items', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: catId, ...item }),
    });
    if (res.ok) {
      setAddingItemCatId(null);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || t('admin.saveError'));
    }
  };

  const updateItem = async (
    id: string,
    patch: { question?: I18nString; answer?: I18nString; faqOrder?: number }
  ) => {
    const res = await fetch(`/api/admin/faq-items/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setEditingItemId(null);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || t('admin.saveError'));
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    const res = await fetch(`/api/admin/faq-items/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) load();
  };

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Add category */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">{t('admin.newFaqCategory')}</h3>
        <div className="grid gap-3 sm:grid-cols-[180px_1fr_120px_auto] sm:items-end">
          <div>
            <label className={labelCls}>{t('admin.fieldKey')}</label>
            <input value={newKey} onChange={(e) => setNewKey(e.target.value)} className={inputCls} placeholder="general" />
          </div>
          <TriTextInput label={t('admin.fieldTitle')} value={newTitle} onChange={setNewTitle} />
          <div>
            <label className={labelCls}>{t('admin.fieldOrder')}</label>
            <input type="number" value={newOrder} onChange={(e) => setNewOrder(Number(e.target.value))} className={inputCls} />
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('admin.add')}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-ink-400">{t('common.loading')}</p>}

      {!loading && !cats.length && (
        <p className="text-sm text-ink-400">{t('admin.noData')}</p>
      )}

      {cats.map((cat) => (
        <div key={cat.id} className="rounded-xl border border-slate-200 bg-white p-5">
          {editingCatId === cat.id ? (
            <CategoryEditForm
              cat={cat}
              onSave={(patch) => updateCategory(cat.id, patch)}
              onCancel={() => setEditingCatId(null)}
            />
          ) : (
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink-900">{firstText(cat.title)}</h3>
                <p className="text-xs text-ink-400">
                  {t('admin.fieldKey')}: {cat.key} · {t('admin.fieldOrder')}: {cat.faqOrder}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCatId(cat.id)}
                  className="rounded-md border border-slate-300 px-2.5 py-1 text-sm text-ink-600 hover:bg-slate-50"
                >
                  {t('admin.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="rounded-md border border-red-300 px-2.5 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  {t('admin.delete')}
                </button>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
            {cat.items.map((item: SiteFaqItem) =>
              editingItemId === item.id ? (
                <ItemEditForm
                  key={item.id}
                  item={item}
                  onSave={(patch) => updateItem(item.id, patch)}
                  onCancel={() => setEditingItemId(null)}
                />
              ) : (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800">{firstText(item.question)}</p>
                    <p className="line-clamp-2 text-xs text-ink-500">{firstText(item.answer)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItemId(item.id)}
                      className="text-sm text-brand-700 hover:underline"
                    >
                      {t('admin.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {t('admin.delete')}
                    </button>
                  </div>
                </div>
              )
            )}

            {addingItemCatId === cat.id ? (
              <ItemEditForm
                item={null}
                onSave={(patch) =>
                  addItem(cat.id, {
                    question: patch.question as I18nString,
                    answer: patch.answer as I18nString,
                    faqOrder: patch.faqOrder ?? 0,
                  })
                }
                onCancel={() => setAddingItemCatId(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingItemCatId(cat.id)}
                className="rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                + {t('admin.addFaqItem')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryEditForm({
  cat,
  onSave,
  onCancel,
}: {
  cat: SiteFaqCategory;
  onSave: (patch: { key?: string; title?: I18nString; faqOrder?: number }) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(cat.key);
  const [title, setTitle] = useState<I18nString>(cat.title);
  const [order, setOrder] = useState(cat.faqOrder);
  return (
    <div className="mb-3 space-y-3 rounded-lg bg-slate-50 p-3">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr_120px]">
        <div>
          <label className={labelCls}>{t('admin.fieldKey')}</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} className={inputCls} />
        </div>
        <TriTextInput label={t('admin.fieldTitle')} value={title} onChange={setTitle} />
        <div>
          <label className={labelCls}>{t('admin.fieldOrder')}</label>
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ key: key.trim(), title, faqOrder: order })}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t('admin.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-white"
        >
          {t('admin.cancel')}
        </button>
      </div>
    </div>
  );
}

function ItemEditForm({
  item,
  onSave,
  onCancel,
}: {
  item: SiteFaqItem | null;
  onSave: (patch: { question?: I18nString; answer?: I18nString; faqOrder?: number }) => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState<I18nString>(item?.question ?? emptyI18n());
  const [answer, setAnswer] = useState<I18nString>(item?.answer ?? emptyI18n());
  const [order, setOrder] = useState(item?.faqOrder ?? 0);
  return (
    <div className="space-y-3 rounded-lg bg-slate-50 p-3">
      <TriTextInput label={t('admin.faqQuestion')} value={question} onChange={setQuestion} />
      <TriTextArea label={t('admin.faqAnswer')} value={answer} onChange={setAnswer} rows={3} />
      <div className="flex items-end gap-3">
        <div className="w-40">
          <label className={labelCls}>{t('admin.fieldOrder')}</label>
          <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputCls} />
        </div>
        <button
          type="button"
          onClick={() => onSave({ question, answer, faqOrder: order })}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t('admin.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-white"
        >
          {t('admin.cancel')}
        </button>
      </div>
    </div>
  );
}
