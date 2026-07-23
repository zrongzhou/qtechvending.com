'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import zh from '@/messages/zh.json';

const t = (k: string) => (zh as Record<string, string>)[k] || k;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(t('admin.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        let msg = t('admin.passwordError');
        try {
          const data = await res.json();
          if (data && typeof data.error === 'string') msg = data.error;
        } catch {
          /* keep default message */
        }
        setError(msg);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminNav />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white text-xl font-bold">
              Q
            </div>
            <h1 className="text-xl font-bold text-ink-900">{t('admin.changePassword')}</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('admin.currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('admin.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                {t('admin.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {t('admin.passwordUpdated')}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? '...' : t('admin.changePassword')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/xiaozhouBackend')}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-slate-50"
            >
              {t('admin.backToDashboard')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
