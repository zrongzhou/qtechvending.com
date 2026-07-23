'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
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

export interface ImagePickerProps {
  /** Controlled list of image paths (first element is the cover). */
  value: string[];
  onChange: (next: string[]) => void;
  /** Upload bucket — also sent to the upload API. */
  type: 'products' | 'blog';
  /** Entity slug; required for uploads (per architecture §8 ruling 1). */
  slug?: string;
  label?: string;
  hint?: string;
}

/**
 * V52 ImagePicker — the single image editor for products & blogs.
 *
 * Supports two input modes:
 *  1. Upload mode — click or drag files into the drop zone; each file is POSTed
 *     to /api/admin/upload and its returned path is appended to `value`.
 *  2. Manual mode (legacy fallback) — type a path and click "add".
 *
 * Thumbnails render in a grid; the first item (images[0]) is flagged as the
 * cover. Items can be removed or reordered (left/right buttons or HTML5 drag).
 * Uploading disables the control to prevent duplicate submissions.
 */
export default function ImagePicker({ value, onChange, type, slug, label, hint }: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [manualPath, setManualPath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setAt = (i: number, v: string) => {
    const next = value.slice();
    next[i] = v;
    onChange(next);
  };
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
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= value.length || to >= value.length) return;
    const next = value.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const UPLOAD_TIMEOUT_MS = 120_000; // 2 minutes per file

  const uploadFiles = async (files: File[] | FileList) => {
    if (!slug) {
      setUploadError(t('admin.uploadNeedSlug'));
      return;
    }
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    setUploadError('');
    let next = [...value];
    for (const f of list) {
      try {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('type', type);
        fd.append('slug', slug);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          credentials: 'include',
          body: fd,
          signal: controller.signal,
        });
        clearTimeout(timer);
        const j = (await res.json().catch(() => ({}))) as { data?: string[]; message?: string; code?: string };
        if (!res.ok) {
          setUploadError(`${f.name}: ${j?.message || j?.code || t('admin.uploadFailed')}`);
          continue;
        }
        if (Array.isArray(j.data) && j.data.length) {
          next = [...next, ...j.data];
        }
      } catch (err: unknown) {
        const msg = err instanceof DOMException && err.name === 'AbortError'
          ? t('admin.uploadTimeout')
          : `${f.name}: ${t('admin.uploadFailed')}`;
        setUploadError(msg);
      }
    }
    onChange(next);
    setUploading(false);
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) uploadFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!slug || uploading) return;
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const addManual = () => {
    const p = manualPath.trim();
    if (!p) return;
    onChange([...value, p]);
    setManualPath('');
  };

  const canUpload = !!slug && !uploading;

  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}

      {/* Upload drop zone (or slug-required hint) */}
      {slug ? (
        <div
          onClick={() => canUpload && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (canUpload) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-300 bg-slate-50'
          } ${uploading ? 'cursor-wait opacity-70' : 'hover:border-brand-400'}`}
        >
          <span className="text-2xl">📁</span>
          <p className="mt-1 font-medium text-slate-700">
            {uploading ? t('admin.uploading') : t('admin.uploadDrop')}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{t('admin.uploadClick')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/gif"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
          {t('admin.uploadNeedSlug')}
        </div>
      )}

      {uploadError && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {uploadError}
        </p>
      )}

      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, i) => (
            <div
              key={i}
              draggable={!uploading}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData('text/plain'));
                if (!Number.isNaN(from)) reorder(from, i);
              }}
              className="group relative rounded-md border border-slate-200 bg-white p-2"
            >
              <div className="relative">
                {url.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url.trim()}
                    alt={`preview ${i + 1}`}
                    className="h-20 w-full rounded object-cover"
                  />
                ) : (
                  <div className="h-20 w-full rounded bg-slate-100" />
                )}
                {i === 0 && (
                  <span className="absolute -top-2 -left-2 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    {t('admin.cover')}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
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
            </div>
          ))}
        </div>
      )}

      {/* Manual path fallback */}
      <div className="mt-3 flex gap-2">
        <input
          value={manualPath}
          onChange={(e) => setManualPath(e.target.value)}
          placeholder="/images/products/<slug>/1.webp"
          className={inputCls}
        />
        <button type="button" onClick={addManual} className={addBtnCls}>
          + {t('admin.uploadAddManual')}
        </button>
      </div>

      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
