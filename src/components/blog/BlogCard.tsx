'use client';

import Link from 'next/link';
import { CalendarDays, ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { localized } from '@/lib/localize';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import IconTile from '@/components/ui/IconTile';
import OceanGlassCard from '@/components/ui/OceanGlassCard';
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
    <OceanGlassCard depth="sm" hoverLift className="group h-full border border-ocean-200/50">
      <Link
        href={`/${locale}/blog/${post.slug}`}
        className="group/link relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        {/* Persistent ocean top accent bar — card memory point */}
        <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl bg-gradient-to-r from-ocean-400 to-brand-600" />

        <div className="relative aspect-video overflow-hidden bg-slate-100">
          <ImageWithRetry
            src={post.image || '/images/og-default.svg'}
            alt={title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          {/* Ocean-tinted scrim for a cohesive, on-theme finish */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-900/40 via-transparent to-transparent" />
          {/* Date pill */}
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-600 shadow-sm backdrop-blur">
            <IconTile icon={CalendarDays} className="h-3.5 w-3.5" tileClassName="" />
            {formatDate(post.publishedAt, locale)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold leading-snug text-ink-900 transition-colors group-hover:text-ocean-700">
            {title}
          </h3>
          {excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">{excerpt}</p>}

          <div className="mt-auto flex items-center justify-between pt-4">
            {/* Ocean primary "read more" pill */}
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-ocean-500 to-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition group-hover:shadow-ocean">
              {t('blog.readMore')}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={2.25} />
            </span>
          </div>
        </div>
      </Link>
    </OceanGlassCard>
  );
}
