'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import BlogCard from '@/components/blog/BlogCard';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import type { BlogPost } from '@/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const { t, locale } = useLocale();
  if (!posts.length) return null;

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-qtech">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t('home.blog.eyebrow')}</p>
            <h2 className="section-title">{t('home.blog.title')}</h2>
            <p className="section-subtitle">{t('home.blog.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/blog`}
            className="shrink-0 rounded-full border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            {t('home.blog.viewAll')} <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <RevealOnScroll key={post.id} delay={i * 80} className="h-full">
              <BlogCard post={post} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
