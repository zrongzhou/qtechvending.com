'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, ChevronDown } from 'lucide-react';
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

interface FaqItem { q: string; a: string }

function parseFaqBlock(lines: string[]): FaqItem[] {
  const items: FaqItem[] = [];
  let cur: FaqItem | null = null;
  for (const raw of lines) {
    const ln = raw.trim();
    const m = ln.match(/^###\s*Q\d*[:.]?\s*(.+)$/i);
    if (m) {
      if (cur) items.push(cur);
      cur = { q: m[1].trim(), a: '' };
      continue;
    }
    if (!cur) continue;
    // answer line may start with "A:" / "Answer:" — strip that prefix
    const am = ln.match(/^(?:A|Answer)\s*[:.]?\s*(.+)$/i);
    const body = am ? am[1] : ln;
    if (body) cur.a = cur.a ? `${cur.a} ${body}` : body;
  }
  if (cur) items.push(cur);
  return items;
}

/* Detect whether a block of consecutive lines reads like a bare-line list
   (e.g. "Shopping malls" / "Amusement parks" with no "- " prefix). */
function looksLikeBareList(lines: string[]): boolean {
  if (lines.length < 3) return false;
  return lines.every((l) => {
    const t = l.trim();
    return t.length > 0 && t.length < 80 && !/^[#>*`\-*]/.test(t);
  });
}

function renderRichContent(text: string, t: (key: string) => string) {
  const raw = text.split('\n');
  const els: (JSX.Element | null)[] = [];
  let idx = 0;
  const faqAccents = ['#0891B2', '#0E7490', '#155E75', '#0D9488', '#0284C7'];
  let faqCount = 0;

  while (idx < raw.length) {
    const ln = raw[idx].trim();
    if (!ln) { idx++; continue; }

    // FAQ block: starts with ### Q... and runs until next ## / ### Q / EOF
    if (/^###\s*Q\d/i.test(ln) || /^###\s*FAQ/i.test(ln)) {
      const block: string[] = [];
      if (/^###\s*FAQ/i.test(ln)) { idx++; } // skip a standalone "FAQ" heading
      while (
        idx < raw.length
        && raw[idx].trim() !== ''
        && !/^##\s/.test(raw[idx])
        && !/^###\s*Conclusion/i.test(raw[idx])
      ) {
        block.push(raw[idx]); idx++;
      }
      const faqs = parseFaqBlock(block);
      if (faqs.length > 0) {
        faqCount++;
        els.push(
          <div key={`faq-${faqCount}`} className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-5 w-1.5 rounded-full bg-brand-500" />
              <h2 className="text-2xl font-semibold text-ink-900">{t('blog.faqTitle')}</h2>
            </div>
            <BlogFaqAccordion items={faqs} accents={faqAccents} />
          </div>,
        );
      }
      continue;
    }

    // Conclusion block — render with a highlighted panel
    if (/^##\s*(Conclusion|结论|خاتمة)/i.test(ln)) {
      idx++;
      const block: string[] = [];
      while (
        idx < raw.length
        && raw[idx].trim() !== ''
        && !/^##\s/.test(raw[idx])
        && !/^###\s/.test(raw[idx])
      ) {
        block.push(raw[idx].trim()); idx++;
      }
      const text2 = block.join(' ');
      els.push(
        <div key={idx} className="mt-10 rounded-2xl border border-brand-100 bg-brand-50/60 p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">{t('blog.conclusion')}</p>
          <p className="text-[15px] leading-8 text-ink-700 sm:text-[17px]">{text2}</p>
        </div>,
      );
      continue;
    }

    // headings
    if (ln.startsWith('### ')) {
      els.push(<h3 key={idx} className="mt-8 mb-3 flex items-center gap-2 text-xl font-semibold text-ink-900"><span className="h-4 w-1 rounded-full bg-brand-400" />{ln.slice(4)}</h3>); idx++;
    }
    else if (ln.startsWith('## ')) {
      const numMatch = ln.slice(3).match(/^(\d+)\.\s*(.*)$/);
      if (numMatch) {
        els.push(
          <h2 key={idx} className="mt-10 mb-4 flex items-start gap-3 border-s-4 border-brand-300 ps-4 text-2xl font-bold tracking-tight text-ink-900">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{numMatch[1]}</span>
            <span>{numMatch[2]}</span>
          </h2>,
        );
      } else {
        els.push(<h2 key={idx} className="mt-10 mb-4 border-s-4 border-brand-300 ps-4 text-2xl font-semibold tracking-tight text-ink-900">{ln.slice(3)}</h2>);
      }
      idx++;
    }
    else if (ln.startsWith('# ')) { els.push(<h1 key={idx} className="mt-8 mb-4 text-3xl font-semibold text-ink-900">{ln.slice(2)}</h1>); idx++; }
    // unordered list (markdown-style)
    else if (ln.startsWith('- ') || ln.startsWith('* ')) {
      const items: string[] = [];
      while (idx < raw.length && (raw[idx].trim().startsWith('- ') || raw[idx].trim().startsWith('* '))) {
        items.push(raw[idx].trim().slice(2)); idx++;
      }
      els.push(
        <ul key={idx} className="mb-7 space-y-3 ps-5">
          {items.map((it, j) => (
            <li key={j} className="relative text-[15px] leading-7 text-ink-700 sm:text-[16px] before:content-[''] before:absolute before:-left-4 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-500">
              {it}
            </li>
          ))}
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
        // bare-line list detection: a block that joined reads as many short lines
        if (looksLikeBareList(parts)) {
          els.push(
            <ul key={idx} className="mb-7 rounded-xl bg-slate-50/70 p-5 ps-6 space-y-3">
              {parts.map((it, j) => (
                <li key={j} className="relative text-[15px] leading-7 text-ink-700 sm:text-[16px] before:content-[''] before:absolute before:-left-5 before:top-[0.6em] before:h-2 before:w-2 before:rounded-full before:bg-brand-400 before:shadow-sm before:shadow-brand-200">
                  {it}
                </li>
              ))}
            </ul>,
          );
        } else {
          els.push(
            <p key={idx} className="mb-6 text-[15px] leading-8 text-ink-800 sm:text-[16px]">
              {parts.join(' ')}
            </p>
          );
        }
      }
    }
  }
  return els;
}

function BlogFaqAccordion({ items, accents }: { items: FaqItem[]; accents: string[] }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="space-y-4">
      {items.map((it, i) => {
        const isOpen = open === i;
        const accent = accents[i % accents.length];
        return (
          <div
            key={i}
            className="faq-accent-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition"
            style={{ borderInlineStart: `4px solid ${accent}`, '--accent': accent } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: accent }}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] font-semibold text-ink-900">{it.q}</span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/40 px-5 pb-5 ps-12 text-[15px] leading-7 text-ink-700 sm:text-[17px]">{it.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
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

      <RevealOnScroll className="mx-auto mt-10 max-w-prose">
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-8 shadow-lg backdrop-blur-sm lg:p-10">
          {renderRichContent(content, t)}
        </div>
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
