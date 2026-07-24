import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';
import JsonLd from '@/components/JsonLd';
import { getBlogBySlug, getBlogs } from '@/lib/data';
import { localized } from '@/lib/localize';
import { generatePageMetadata, jsonLdArticle } from '@/lib/seo';
import { seoKeywordList } from '@/lib/seo-keywords';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return generatePageMetadata({ path: `/blog/${slug}`, locale });
  const title = localized(post.title, locale as 'en' | 'zh' | 'ar');
  const seoTitle = post.seoTitle ? localized(post.seoTitle, locale as 'en' | 'zh' | 'ar') : '';
  // S-06: prefer the dedicated SEO description, falling back to the excerpt.
  const desc =
    (post.seoDescription && post.seoDescription.trim()) ||
    localized(post.excerpt, locale as 'en' | 'zh' | 'ar') ||
    '';
  const kw = seoKeywordList(post.seoKeywords, locale as 'en' | 'zh' | 'ar');
  return generatePageMetadata({
    path: `/blog/${slug}`,
    locale,
    title: seoTitle || title,
    description: desc,
    image: post.images?.[0] || undefined,
    type: 'article',
    publishedTime: post.publishedAt,
    author: post.author,
    keywords: kw && kw.length ? kw : [title],
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) notFound();

  const all = await getBlogs(1, 10);
  const related = all.data.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={jsonLdArticle({
          title: localized(post.title, locale as 'en' | 'zh' | 'ar'),
          description: localized(post.excerpt, locale as 'en' | 'zh' | 'ar') || '',
          image: post.images?.[0] || '/images/og-default.svg',
          slug,
          datePublished: post.publishedAt,
          author: post.author,
        })}
      />
      <BlogDetailClient post={post} related={related} />
    </>
  );
}
