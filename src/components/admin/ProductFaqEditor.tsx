'use client';

import type { FaqItem, I18nString } from '@/types';
import { t } from './i18n';
import { emptyI18n } from './I18nInputs';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';

/** Controlled sub-editor for a product's FAQ list (q/a multi-language rows + order). */
export default function ProductFaqEditor({
  value,
  onChange,
}: {
  value: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  const update = (idx: number, patch: Partial<FaqItem>) => {
    onChange(value.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));
  const add = () => onChange([...value, { q: emptyI18n(), a: emptyI18n(), order: value.length }]);

  return (
    <div className="space-y-4">
      {value.map((item, idx) => (
        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-700">
              {t('admin.faqItem')} #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-sm text-red-600 hover:underline"
            >
              {t('admin.delete')}
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-3">
              {(['en', 'zh', 'ar'] as const).map((lang) => (
                <input
                  key={lang}
                  placeholder={`Q (${lang.toUpperCase()})`}
                  value={item.q?.[lang] ?? ''}
                  onChange={(e) =>
                    update(idx, { q: { ...(item.q ?? emptyI18n()), [lang]: e.target.value } })
                  }
                  className={inputCls}
                />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['en', 'zh', 'ar'] as const).map((lang) => (
                <textarea
                  key={lang}
                  rows={3}
                  placeholder={`A (${lang.toUpperCase()})`}
                  value={item.a?.[lang] ?? ''}
                  onChange={(e) =>
                    update(idx, { a: { ...(item.a ?? emptyI18n()), [lang]: e.target.value } })
                  }
                  className={`${inputCls} resize-y`}
                />
              ))}
            </div>
            <div className="w-40">
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('admin.fieldOrder')}</label>
              <input
                type="number"
                value={item.order ?? idx}
                onChange={(e) => update(idx, { order: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        + {t('admin.addFaqItem')}
      </button>
    </div>
  );
}
