'use client';

import type { I18nStringList } from '@/types';
import { t } from './i18n';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

const LANGS = ['en', 'zh', 'ar'] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABEL: Record<Lang, string> = {
  en: 'EN',
  zh: '中文',
  ar: 'العربية',
};

const moveBtnCls =
  'flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30';
const removeBtnCls =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-red-300 text-sm text-red-600 transition hover:bg-red-50';
const addBtnCls =
  'rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50';

export interface FeaturesEditorProps {
  /** Controlled tri-lingual features: { en: string[], zh: string[], ar: string[] }. */
  value: I18nStringList;
  onChange: (next: I18nStringList) => void;
}

/**
 * Editor for the product "核心卖点" (key selling points) — a tri-lingual list of
 * strings ({ en, zh, ar }). Each language maintains its own ordered array with
 * add / remove / move-up / move-down controls, mirroring the existing
 * specifications editor style. Empty languages default to `[]`.
 */
export default function FeaturesEditor({ value, onChange }: FeaturesEditorProps) {
  const safe: Record<Lang, string[]> = {
    en: value?.en ?? [],
    zh: value?.zh ?? [],
    ar: value?.ar ?? [],
  };

  const updateLang = (lang: Lang, arr: string[]) => onChange({ ...safe, [lang]: arr });
  const setAt = (lang: Lang, i: number, v: string) => {
    const next = safe[lang].slice();
    next[i] = v;
    updateLang(lang, next);
  };
  const addFeature = (lang: Lang) => updateLang(lang, [...safe[lang], '']);
  const removeAt = (lang: Lang, i: number) => updateLang(lang, safe[lang].filter((_, idx) => idx !== i));
  const move = (lang: Lang, i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= safe[lang].length) return;
    const next = safe[lang].slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    updateLang(lang, next);
  };

  return (
    <div className="space-y-5">
      {LANGS.map((lang) => (
        <div key={lang}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{LANG_LABEL[lang]}</span>
            <button type="button" onClick={() => addFeature(lang)} className={addBtnCls}>
              + {t('admin.add')}
            </button>
          </div>
          <div className="space-y-2">
            {safe[lang].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={f}
                  onChange={(e) => setAt(lang, i, e.target.value)}
                  placeholder={t('admin.fieldFeatures')}
                  className={inputCls}
                />
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(lang, i, -1)}
                    disabled={i === 0}
                    title={t('admin.moveUp')}
                    aria-label={t('admin.moveUp')}
                    className={moveBtnCls}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(lang, i, 1)}
                    disabled={i === safe[lang].length - 1}
                    title={t('admin.moveDown')}
                    aria-label={t('admin.moveDown')}
                    className={moveBtnCls}
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(lang, i)}
                  aria-label={t('admin.delete')}
                  className={removeBtnCls}
                >
                  ✕
                </button>
              </div>
            ))}
            {!safe[lang].length && (
              <p className="text-xs text-ink-400">{t('admin.noData')}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
