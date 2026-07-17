'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import BlogCard from '@/components/blog/BlogCard';
import IconTile from '@/components/ui/IconTile';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
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

function renderRichContent(text: string) {
  const raw = text.split('\n');
  const els: (JSX.Element | null)[] = [];
  let idx = 0;
  while (idx < raw.length) {
    const ln = raw[idx].trim();
    if (!ln) { idx++; continue; }

    // headings
    if (ln.startsWith('### ')) { els.push(<h3 key={idx} className="mt-8 mb-3 text-xl font-bold text-ink-900">{ln.slice(4)}</h3>); idx++; }
    else if (ln.startsWith('## ')) { els.push(<h2 key={idx} className="mt-10 mb-4 text-2xl font-bold tracking-tight text-ink-900">{ln.slice(3)}</h2>); idx++; }
    else if (ln.startsWith('# ')) { els.push(<h1 key={idx} className="mt-8 mb-4 text-3xl font-bold text-ink-900">{ln.slice(2)}</h1>); idx++; }
    // unordered list
    else if (ln.startsWith('- ') || ln.startsWith('* ')) {
      const items: string[] = [];
      while (idx < raw.length && (raw[idx].trim().startsWith('- ') || raw[idx].trim().startsWith('* '))) {
        items.push(raw[idx].trim().slice(2)); idx++;
      }
      els.push(
        <ul key={idx} className="mb-5 ms-6 space-y-1.5 list-disc marker:text-brand-600 text-ink-600">
          {items.map((it, j) => <li key={j} className="leading-relaxed">{it}</li>)}
        </ul>,
      );
    }
    // paragraph(s) — collect consecutive non-empty non-markdown lines
    else {
      const parts: string[] = [];
      while (
        idx < raw.length
        && raw[idx].trim() !== ''
        && !/^#{1,3}\s/.test(raw[idx])
        && !/^[*-]\s/.test(raw[idx])
      ) {
        parts.push(raw[idx].trim()); idx++;
      }
      if (parts.length > 0) {
        els.push(<p key={idx} className="mb-4 leading-relaxed text-ink-600">{parts.join(' ')}</p>);
      }
    }
  }
  return els;
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
      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
        {t('blog.back')}
      </Link>

      <nav className="mb-6 mt-4 text-sm text-ink-500">
        <Link href={`/${locale}`} className="hover:text-brand-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}/blog`} className="hover:text-brand-700">{t('nav.blog')}</Link>
      </nav>

      <RevealOnScroll className="mx-auto max-w-3xl text-center">
        <header>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <IconTile icon={CalendarDays} className="h-3.5 w-3.5" tileClassName="" />
            {t('blog.publishedOn')} {formatDate(post.publishedAt, locale)}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem]">{title}</h1>
          {excerpt && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">{excerpt}</p>}
        </header>
      </RevealOnScroll>

      <RevealOnScroll className="mx-auto mt-8 max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 shadow-sm ring-1 ring-brand-100">
          <ImageWithRetry src={post.image || '/images/og-default.svg'} alt={title} className="h-full w-full object-cover" />
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="prose-qtech mx-auto mt-10 max-w-3xl">
        {renderRichContent(content)}
      </RevealOnScroll>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl border-t border-slate-100 pt-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-full bg-brand-500" />
            <h2 className="text-2xl font-bold text-ink-900">{t('blog.related')}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((p, i) => (
              <RevealOnScroll key={p.id} delay={i * 80} className="h-full">
                <BlogCard post={p} />
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
