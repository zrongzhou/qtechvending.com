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
        <span className="inline-flex items-center gap-1 text-sm text-ink-400">
          <CalendarDays className="h-4 w-4" />
          {t('blog.publishedOn')} {formatDate(post.publishedAt, locale)}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        {excerpt && <p className="mt-4 text-lg text-ink-500">{excerpt}</p>}
      </header>

      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
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
        <section className="mx-auto mt-14 max-w-5xl">
          <h2 className="text-2xl font-bold text-ink-900">{t('blog.related')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
