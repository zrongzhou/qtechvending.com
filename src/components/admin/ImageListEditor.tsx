'use client';

import { t } from './i18n';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

const moveBtnCls =
  'flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30';
const removeBtnCls =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-red-300 text-sm text-red-600 transition hover:bg-red-50';
const addBtnCls =
  'rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50';

export interface ImageListEditorProps {
  /** Controlled list of image paths (first element is the cover). */
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  hint?: string;
}

/**
 * Reusable multi-image editor for products / blogs.
 *
 * - Each entry is a path input (e.g. `/images/products/<slug>/1.webp`).
 * - The first entry is flagged as the cover (本期约定 images[0] = 封面).
 * - Supports add / remove / move-up / move-down to reorder (order = display order).
 * - Reuses the shared `inputCls` / `labelCls` Tailwind styles for visual parity.
 */
export default function ImageListEditor({ value, onChange, label, hint }: ImageListEditorProps) {
  const setAt = (i: number, v: string) => {
    const next = value.slice();
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...value, '']);
  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  };

  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <div className="space-y-2">
        {value.map((url, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="relative shrink-0">
              {url.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url.trim()}
                  alt={`preview ${i + 1}`}
                  className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-md border border-dashed border-slate-300 bg-slate-50" />
              )}
              {i === 0 && (
                <span className="absolute -top-2 -left-2 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {t('admin.fieldCoverImage')}
                </span>
              )}
            </div>
            <input
              value={url}
              onChange={(e) => setAt(i, e.target.value)}
              placeholder="/images/products/<slug>/1.webp"
              className={inputCls}
            />
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title={t('admin.moveUp')}
                aria-label={t('admin.moveUp')}
                className={moveBtnCls}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                title={t('admin.moveDown')}
                aria-label={t('admin.moveDown')}
                className={moveBtnCls}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={t('admin.delete')}
              className={removeBtnCls}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className={addBtnCls}>
          + {t('admin.addImage')}
        </button>
      </div>
      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
