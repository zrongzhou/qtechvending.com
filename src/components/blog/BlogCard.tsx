'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import type { BlogPost } from '@/types';

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ar' ? 'ar' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const { locale, t } = useLocale();
  const title = localized(post.title, locale);
  const excerpt = localized(post.excerpt, locale);

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:border-brand-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <ImageWithRetry
          src={post.image || '/images/og-default.svg'}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(post.publishedAt, locale)}
        </span>
        <h3 className="mt-2 text-lg font-semibold text-ink-900 group-hover:text-brand-700">
          {title}
        </h3>
        {excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-500">{excerpt}</p>}
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700">
          {t('blog.readMore')} →
        </span>
      </div>
    </Link>
  );
}
