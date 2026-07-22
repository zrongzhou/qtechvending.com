'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import zh from '@/messages/zh.json';

const t = (k: string) => (zh as Record<string, string>)[k] || k;

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.push('/xiaozhouBackend/login');
    router.refresh();
  };

  const links = [
    { href: '/xiaozhouBackend', label: t('admin.dashboard') },
    { href: '/xiaozhouBackend/contact-messages', label: t('admin.contactMessages') },
    { href: '/xiaozhouBackend/categories', label: t('admin.categories') },
    { href: '/xiaozhouBackend/products', label: t('admin.products') },
    { href: '/xiaozhouBackend/blogs', label: t('admin.blogs') },
    { href: '/xiaozhouBackend/site-settings', label: t('admin.siteSettings') },
    { href: '/xiaozhouBackend/faq', label: t('admin.faq') },
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/xiaozhouBackend" className="text-lg font-bold text-brand-700">
            Qtech Admin
          </Link>
          <nav className="flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === l.href ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-slate-50'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-slate-50"
        >
          {t('admin.logout')}
        </button>
      </div>
    </header>
  );
}
