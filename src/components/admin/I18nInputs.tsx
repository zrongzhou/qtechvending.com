'use client';

import type { I18nString, I18nStringList } from '@/types';

export function emptyI18n(): I18nString {
  return { en: '', zh: '', ar: '' };
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

/** Three side-by-side inputs (en / zh / ar) for a localized string field. */
export function TriTextInput({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: I18nString | null | undefined;
  onChange: (v: I18nString) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const v: I18nString = value ?? emptyI18n();
  const set = (lang: 'en' | 'zh' | 'ar', val: string) => onChange({ ...v, [lang]: val });
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {(['en', 'zh', 'ar'] as const).map((lang) => (
          <input
            key={lang}
            value={v[lang] ?? ''}
            onChange={(e) => set(lang, e.target.value)}
            placeholder={placeholder ? `${placeholder} (${lang.toUpperCase()})` : lang.toUpperCase()}
            className={inputCls}
          />
        ))}
      </div>
    </div>
  );
}

/** Three side-by-side textareas (en / zh / ar) for a localized long-text field. */
export function TriTextArea({
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  label: string;
  value: I18nString | null | undefined;
  onChange: (v: I18nString) => void;
  rows?: number;
  required?: boolean;
}) {
  const v: I18nString = value ?? emptyI18n();
  const set = (lang: 'en' | 'zh' | 'ar', val: string) => onChange({ ...v, [lang]: val });
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {(['en', 'zh', 'ar'] as const).map((lang) => (
          <textarea
            key={lang}
            rows={rows}
            value={v[lang] ?? ''}
            onChange={(e) => set(lang, e.target.value)}
            placeholder={lang.toUpperCase()}
            className={`${inputCls} resize-y`}
          />
        ))}
      </div>
    </div>
  );
}

/** Three side-by-side textareas for comma-separated localized keyword lists. */
export function TriListInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: I18nStringList | null | undefined;
  onChange: (v: I18nStringList) => void;
}) {
  const v: I18nStringList = value ?? { en: [], zh: [], ar: [] };
  const setArr = (lang: 'en' | 'zh' | 'ar', text: string) =>
    onChange({ ...v, [lang]: text.split(',').map((s) => s.trim()).filter(Boolean) });
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="grid gap-2 sm:grid-cols-3">
        {(['en', 'zh', 'ar'] as const).map((lang) => (
          <textarea
            key={lang}
            rows={2}
            value={(v[lang] ?? []).join(', ')}
            onChange={(e) => setArr(lang, e.target.value)}
            placeholder={`${lang.toUpperCase()} (comma separated)`}
            className={`${inputCls} resize-y`}
          />
        ))}
      </div>
    </div>
  );
}
