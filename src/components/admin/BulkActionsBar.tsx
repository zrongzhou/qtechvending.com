'use client';

import { t } from './i18n';

export type BulkAction = 'publish' | 'unpublish' | 'delete';

/** Reusable toolbar for bulk operations (publish / unpublish / delete) on the
 *  product & blog list pages. Renders nothing when no rows are selected. */
export default function BulkActionsBar({
  selected,
  onClear,
  onAction,
  loading,
}: {
  selected: Array<string | number>;
  onClear: () => void;
  onAction: (action: BulkAction) => void;
  loading?: boolean;
}) {
  if (!selected.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
      <span className="font-medium text-brand-700">
        {t('admin.selectedCount').replace('{n}', String(selected.length))}
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={() => onAction('publish')}
        className="rounded-md border border-emerald-300 px-2.5 py-1 font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
      >
        {t('admin.bulkPublish')}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => onAction('unpublish')}
        className="rounded-md border border-amber-300 px-2.5 py-1 font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-40"
      >
        {t('admin.bulkUnpublish')}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => onAction('delete')}
        className="rounded-md border border-red-300 px-2.5 py-1 font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
      >
        {t('admin.bulkDelete')}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-ink-600 hover:bg-slate-50"
      >
        {t('admin.clearSelection')}
      </button>
    </div>
  );
}
