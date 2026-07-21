'use client';

import type { CSSProperties } from 'react';
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

/** V49.10: a TIGHT, harmonious cool palette (cyan / indigo / teal) shared with
 *  the FAQ + Contact pages so the whole site reads as one intentional system —
 *  no clashing magenta/sky that made V49.9 feel messy. Each card still gets its
 *  own top bar / glow / pill hue, just within the same family. */
const BLOG_ACCENTS = [
  { from: '#22d3ee', to: '#0891b2' }, // cyan
  { from: '#818cf8', to: '#4338ca' }, // indigo
  { from: '#2dd4bf', to: '#0f766e' }, // teal
];

export default function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const { locale, t } = useLocale();
  const accent = BLOG_ACCENTS[index % BLOG_ACCENTS.length];
  const title = localized(post.title, locale);
  const excerpt = localized(post.excerpt, locale);

  return (
    <div className="relative h-full">
      {/* Soft ocean-brand glow behind the glass blog card */}
      <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl" aria-hidden="true" style={{ background: `linear-gradient(to bottom right, ${accent.from}, ${accent.to})` }} />
      <OceanGlassCard depth="sm" hoverLift className="group relative z-10 h-full border border-ocean-200/50">
        <Link
          href={`/${locale}/blog/${post.slug}`}
          className="group/link relative flex h-full flex-col overflow-hidden rounded-2xl"
        >
          {/* Persistent ocean top accent bar — card memory point */}
          <span className="absolute inset-x-0 top-0 z-20 h-1 rounded-t-2xl" style={{ background: `linear-gradient(to right, ${accent.from}, ${accent.to})` }} />

          <div className="relative aspect-video overflow-hidden bg-slate-100">
            <ImageWithRetry
              src={post.image || '/images/og-default.svg'}
              alt={title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            {/* Ocean-tinted scrim for a cohesive, on-theme finish */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-900/40 via-transparent to-transparent" />
            {/* Hover gradient overlay — fades in to deepen the scene and reveal
                the category tag below. */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {/* Date pill (persistent) — premium: larger padding + subtle border */}
            <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm backdrop-blur">
              <IconTile icon={CalendarDays} className="h-3.5 w-3.5" tileClassName="" />
              {formatDate(post.publishedAt, locale)}
            </span>
            {/* Category tag — revealed on hover, same premium treatment */}
            <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover:opacity-100" style={{ color: accent.to }}>
              {locale === 'zh' ? '博客' : locale === 'ar' ? 'المدونة' : 'Blog'}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-bold leading-snug text-ink-900 transition-colors group-hover:text-ocean-700">
              {title}
            </h3>
            {excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">{excerpt}</p>}

            <div className="mt-auto flex items-center justify-between pt-4">
              {/* Ocean primary "read more" pill — gently pulses on hover */}
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition group-hover:animate-[pillPulse_1.6s_ease-in-out_infinite] group-hover:shadow-ocean" style={{ background: `linear-gradient(to right, ${accent.from}, ${accent.to})` }}>
                {t('blog.readMore')}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" strokeWidth={2.25} />
              </span>
            </div>
          </div>
        </Link>
      </OceanGlassCard>
    </div>
  );
}
