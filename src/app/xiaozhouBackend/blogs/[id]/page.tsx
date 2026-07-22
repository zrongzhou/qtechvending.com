'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import BlogForm from '@/components/admin/BlogForm';
import { t } from '@/components/admin/i18n';
import type { BlogPost } from '@/types';

export default function BlogEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blogs/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setPost(j.data || null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink-900">{t('admin.editBlog')}</h1>
          <button
            type="button"
            onClick={() => router.push('/xiaozhouBackend/blogs')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-slate-50"
          >
            {t('admin.backToList')}
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-ink-400">{t('common.loading')}</p>
        ) : !post ? (
          <p className="text-sm text-ink-400">{t('admin.notFound')}</p>
        ) : (
          <BlogForm initial={post} onSaved={() => router.push('/xiaozhouBackend/blogs')} />
        )}
      </main>
    </div>
  );
}
