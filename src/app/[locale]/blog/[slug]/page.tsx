import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';
import JsonLd from '@/components/JsonLd';
import { getBlogBySlug, getBlogs } from '@/lib/data';
import { localized } from '@/lib/localize';
import { generatePageMetadata, jsonLdArticle } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);
  if (!post) return generatePageMetadata({ path: `/blog/${params.slug}` });
  const title = localized(post.title, params.locale as 'en' | 'zh' | 'ar');
  const desc = localized(post.excerpt, params.locale as 'en' | 'zh' | 'ar') || '';
  return generatePageMetadata({
    path: `/blog/${params.slug}`,
    title,
    description: desc,
    image: post.image || undefined,
    type: 'article',
    publishedTime: post.publishedAt,
    author: post.author,
    keywords: buildStaticKeywords(title),
  });
}

function buildStaticKeywords(title: string): string[] {
  return ['Qtech blog', title].filter(Boolean);
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { locale, slug } = params;
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
          image: post.image || '/images/og-default.svg',
          slug,
          datePublished: post.publishedAt,
          author: post.author,
        })}
      />
      <BlogDetailClient post={post} related={related} />
    </>
  );
}
