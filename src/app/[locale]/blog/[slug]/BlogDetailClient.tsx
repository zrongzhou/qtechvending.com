'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types';

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : locale === 'ar' ? 'ar' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  } catch {
    return iso;
  }
}

function renderParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className="mb-4 leading-relaxed text-ink-600">
        {p}
      </p>
    ));
}

export default function BlogDetailClient({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  const { t, locale } = useLocale();
  const title = localized(post.title, locale);
  const content = localized(post.content, locale);
  const excerpt = localized(post.excerpt, locale);

  return (
    <article className="container-qtech py-10 lg:py-14">
      <nav className="mb-6 text-sm text-ink-400">
        <Link href={`/${locale}`} className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}/blog`} className="hover:text-brand-700">{t('nav.blog')}</Link>
      </nav>

      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <CalendarDays className="h-3.5 w-3.5" />
          {t('blog.publishedOn')} {formatDate(post.publishedAt, locale)}
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-ink-900 sm:text-4xl lg:text-[2.75rem]">{title}</h1>
        {excerpt && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-500">{excerpt}</p>}
      </header>

      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image || '/images/og-default.svg'}
          alt={title}
          className="aspect-[16/9] w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/og-default.svg';
          }}
        />
      </div>

      <div className="prose-qtech mx-auto mt-10 max-w-3xl">
        {renderParagraphs(content)}
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl border-t border-slate-100 pt-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-full bg-brand-500" />
            <h2 className="text-2xl font-bold text-ink-900">{t('blog.related')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
