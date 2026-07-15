'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const { t, locale } = useLocale();
  if (!posts.length) return null;

  return (
    <section className="container-qtech beach-section-alt py-16 lg:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink-900">{t('home.blog.title')}</h2>
          <span className="mt-3 block h-1 w-16 rounded-full bg-coral-400" aria-hidden="true" />
          <p className="mt-2 text-ink-500">{t('home.blog.subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/blog`}
          className="hidden shrink-0 rounded-full border border-coral-200 px-5 py-2.5 text-sm font-semibold text-coral-700 transition hover:bg-coral-50 sm:inline-flex"
        >
          {t('home.blog.viewAll')} →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
