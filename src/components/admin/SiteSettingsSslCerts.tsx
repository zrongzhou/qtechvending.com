'use client';

import { useEffect, useState } from 'react';
import type { SiteSetting, SslCert } from '@/types';
import { t } from './i18n';

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500';
const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';
const addBtnCls =
  'rounded-md border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50';
const dangerBtnCls =
  'rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50';

interface CertForm {
  domain: string;
  certPath: string;
  keyPath: string;
  enabled: boolean;
  /** Transient PEM content pasted in the modal; written to disk on save. */
  certContent: string;
  /** Transient private-key PEM content (paired with certContent). */
  keyContent: string;
}

const emptyForm: CertForm = {
  domain: '',
  certPath: '',
  keyPath: '',
  enabled: true,
  certContent: '',
  keyContent: '',
};

/**
 * Multi-domain SSL certificate manager (V52). Lists certificates, supports
 * add / edit / delete (with confirm), a global forceHttps switch, and a
 * "save & apply" action that PATCHes /api/admin/site-settings — which persists
 * the config and triggers nginx fragment generation + reload on the server.
 * The resulting apply status (success / failure) is shown in the status bar.
 */
export default function SiteSettingsSslCerts({ initial }: { initial?: SiteSetting | null }) {
  const [list, setList] = useState<SslCert[]>([]);
  const [forceHttps, setForceHttps] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SslCert | null>(null);
  const [form, setForm] = useState<CertForm>(emptyForm);
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SslCert | null>(null);

  useEffect(() => {
    if (initial) {
      setList(initial.sslCerts ?? []);
      setForceHttps(initial.forceHttps ?? false);
    }
  }, [initial]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalError('');
    setModalOpen(true);
  };
  const openEdit = (c: SslCert) => {
    setEditing(c);
    setForm({
      domain: c.domain,
      certPath: c.certPath,
      keyPath: c.keyPath,
      enabled: c.enabled,
      certContent: c.certContent || '',
      keyContent: c.keyContent || '',
    });
    setModalError('');
    setModalOpen(true);
  };

  const modalSave = () => {
    const domain = form.domain.trim();
    const certContent = form.certContent.trim();
    const keyContent = form.keyContent.trim();
    const certPath = form.certPath.trim();
    const keyPath = form.keyPath.trim();
    if (!domain) {
      setModalError(`${t('admin.sslDomain')} ${t('admin.required')}`);
      return;
    }
    // Paste mode: if any PEM content is supplied, both must be present.
    let resolvedCertPath = certPath;
    let resolvedKeyPath = keyPath;
    if (certContent || keyContent) {
      if (!certContent || !keyContent) {
        setModalError(t('admin.sslContentBothRequired'));
        return;
      }
      // Server will write to /etc/nginx/ssl/<domain>.crt|.key and rewrite paths.
      resolvedCertPath = `/etc/nginx/ssl/${domain}.crt`;
      resolvedKeyPath = `/etc/nginx/ssl/${domain}.key`;
    } else {
      if (!certPath || !keyPath) {
        setModalError(t('admin.sslPathRequired'));
        return;
      }
    }
    const entry: SslCert = {
      domain,
      certPath: resolvedCertPath,
      keyPath: resolvedKeyPath,
      enabled: form.enabled,
      // Only carry the transient PEM payload when present; the server consumes
      // and strips it (never persisted).
      ...(certContent ? { certContent } : {}),
      ...(keyContent ? { keyContent } : {}),
    };
    setList((prev) => {
      if (editing) return prev.map((c) => (c === editing ? entry : c));
      return [...prev, entry];
    });
    setModalOpen(false);
  };

  const doDelete = () => {
    if (confirmDelete) setList((prev) => prev.filter((c) => c !== confirmDelete));
    setConfirmDelete(null);
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sslCerts: list, forceHttps }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        code?: string;
        nginx?: { appliedDomains?: number };
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        // Map structured SSL error codes to localised messages.
        let msg = j?.message || j?.error || t('admin.saveError');
        if (j?.code === 'SSL_CONTENT_INVALID') msg = t('admin.sslContentInvalid');
        else if (j?.code === 'SSL_WRITE_FAILED') msg = t('admin.sslWriteFailed');
        setStatus({ ok: false, message: msg });
        setSaving(false);
        return;
      }
      const applied = j.nginx?.appliedDomains ?? list.filter((c) => c.enabled).length;
      setStatus({ ok: true, message: t('admin.sslApplied').replace('{n}', String(applied)) });
      setSaving(false);
    } catch {
      setStatus({ ok: false, message: t('admin.saveError') });
      setSaving(false);
    }
  };

  // Paste mode: when either PEM textarea has content, paths are derived from
  // the domain and shown read-only (server writes to /etc/nginx/ssl/<domain>).
  const hasPastedContent = Boolean(form.certContent.trim() || form.keyContent.trim());
  const autoCertPath = form.domain.trim() ? `/etc/nginx/ssl/${form.domain.trim()}.crt` : '';
  const autoKeyPath = form.domain.trim() ? `/etc/nginx/ssl/${form.domain.trim()}.key` : '';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{t('admin.sslCertsTitle')}</h3>
          <p className="mt-0.5 text-xs text-ink-400">{t('admin.sslHint')}</p>
        </div>
        <button type="button" onClick={openAdd} className={addBtnCls}>
          + {t('admin.sslCertAdd')}
        </button>
      </div>

      {/* Global forceHttps switch */}
      <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={forceHttps}
          onChange={(e) => setForceHttps(e.target.checked)}
        />
        {t('admin.forceHttpsGlobal')}
      </label>

      {/* Certificate list */}
      {list.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">{t('admin.sslNoCerts')}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{t('admin.sslDomain')}</th>
                <th className="px-3 py-2">{t('admin.sslCertPath')}</th>
                <th className="px-3 py-2 text-center">{t('admin.sslEnabled')}</th>
                <th className="px-3 py-2 text-right">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-ink-900">{c.domain}</td>
                  <td className="max-w-[16rem] truncate px-3 py-2 text-ink-600" title={c.certPath}>
                    {c.certPath}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {c.enabled ? (
                      <span className="text-brand-600">✓</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="mr-2 text-brand-700 hover:underline"
                    >
                      {t('admin.sslCertEdit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(c)}
                      className="text-red-600 hover:underline"
                    >
                      {t('admin.sslCertDelete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save & apply bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('admin.sslSaveApply')}
        </button>
        {status && (
          <span
            className={`text-sm ${
              status.ok ? 'text-brand-700' : 'text-red-600'
            }`}
          >
            {status.ok ? '✅ ' : '❌ '}
            {status.ok ? status.message : t('admin.sslApplyFailed').replace('{msg}', status.message)}
          </span>
        )}
      </div>

      {/* Add / edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h4 className="mb-4 text-base font-semibold text-ink-900">
              {editing ? t('admin.sslEditTitle') : t('admin.sslAddTitle')}
            </h4>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>{t('admin.sslDomain')}</label>
                <input
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  placeholder="www.qtechvending.com"
                  className={inputCls}
                />
              </div>

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {t('admin.sslPasteHint')}
              </p>

              <div>
                <label className={labelCls}>{t('admin.sslCertContent')}</label>
                <textarea
                  value={form.certContent}
                  onChange={(e) => setForm({ ...form, certContent: e.target.value })}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  rows={4}
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className={labelCls}>{t('admin.sslKeyContent')}</label>
                <textarea
                  value={form.keyContent}
                  onChange={(e) => setForm({ ...form, keyContent: e.target.value })}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  rows={4}
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div>
                <label className={labelCls}>{t('admin.sslCertPath')}</label>
                {hasPastedContent ? (
                  <input
                    value={autoCertPath}
                    readOnly
                    placeholder={t('admin.sslPathAuto')}
                    className={`${inputCls} bg-slate-100 text-slate-500`}
                  />
                ) : (
                  <input
                    value={form.certPath}
                    onChange={(e) => setForm({ ...form, certPath: e.target.value })}
                    placeholder="/etc/nginx/ssl/www/full.pem"
                    className={inputCls}
                  />
                )}
              </div>
              <div>
                <label className={labelCls}>{t('admin.sslKeyPath')}</label>
                {hasPastedContent ? (
                  <input
                    value={autoKeyPath}
                    readOnly
                    placeholder={t('admin.sslPathAuto')}
                    className={`${inputCls} bg-slate-100 text-slate-500`}
                  />
                ) : (
                  <input
                    value={form.keyPath}
                    onChange={(e) => setForm({ ...form, keyPath: e.target.value })}
                    placeholder="/etc/nginx/ssl/www/priv.pem"
                    className={inputCls}
                  />
                )}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                {t('admin.sslEnabled')}
              </label>
            </div>
            {modalError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-ink-600 hover:bg-slate-50">
                {t('admin.cancel')}
              </button>
              <button type="button" onClick={modalSave} className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
                {t('admin.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <p className="text-sm text-ink-700">{t('admin.sslDeleteConfirm')}</p>
            <p className="mt-2 break-all rounded bg-slate-50 px-2 py-1 text-xs text-slate-500">
              {confirmDelete.domain}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-ink-600 hover:bg-slate-50">
                {t('admin.cancel')}
              </button>
              <button type="button" onClick={doDelete} className={dangerBtnCls}>
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
