'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import SiteSettingForm from '@/components/admin/SiteSettingForm';
import { t } from '@/components/admin/i18n';
import type { SiteSetting } from '@/types';

export default function SiteSettingsPage() {
  const [setting, setSetting] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/site-settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setSetting(j.data || null))
      .catch(() => setSetting(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink-900">{t('admin.siteSettings')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('admin.siteSettingsHint')}</p>
        {loading ? (
          <p className="mt-4 text-sm text-ink-400">{t('common.loading')}</p>
        ) : (
          <div className="mt-4">
            <SiteSettingForm initial={setting} onSaved={(s) => setSetting(s)} />
          </div>
        )}
      </main>
    </div>
  );
}
