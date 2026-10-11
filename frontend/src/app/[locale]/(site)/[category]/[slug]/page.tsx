import { getPostUnified, getAllPostsUnified, UnifiedPost } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SingleArticleClient from './SingleArticleClient';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import { optimizeThumbnail } from '@/lib/image';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string; category: string }> }): Promise<Metadata> {
  const { locale, slug, category } = await params;
  const post = await getPostUnified(slug);

  if (!post) return {};

  const url = `/${locale}/${category}/${slug}`;
  const ogImageUrl = absoluteUrl(`/api/og?title=${encodeURIComponent(post.meta.title)}&category=${encodeURIComponent(post.meta.category)}`);

  return {
    title: post.meta.title,
    description: post.meta.excerpt?.slice(0, 160) || post.meta.title,
    alternates: {
      canonical: url,
      languages: {
        vi: `/vi/${category}/${slug}`,
        en: `/en/${category}/${slug}`,
      },
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt,
      url,
      type: 'article',
      publishedTime: post.meta.publishedAt,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.meta.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.excerpt,
      images: [ogImageUrl],
    },
  };
}

// ISR 1h: bài render 1 lần rồi phục vụ từ cache — giảm CPU/SSR trên Workers Free.
export const revalidate = 3600;

// Prerender tĩnh mọi bài viết — Sanity-first, MDX fallback
export async function generateStaticParams() {
  try {
    const posts = await getAllPostsUnified();
    return ['vi', 'en'].flatMap((locale) =>
      posts.map((p) => ({ locale, category: p.meta.category, slug: p.slug }))
    );
  } catch {
    return [];
  }
}

export default async function SingleArticlePage({ params }: { params: Promise<{ locale: string; slug: string; category: string }> }) {
  const { locale, slug, category } = await params;
  const post = await getPostUnified(slug);
  const allPosts = await getAllPostsUnified(); // Sanity-first, MDX fallback

  if (!post || post.meta.category !== category) {
    notFound();
  }

  // Gợi ý "Dành cho bạn" chỉ cần 12 bài gọn nhẹ (slug + meta tối thiểu).
  // KHÔNG truyền allPosts full (kèm content/body ~170 bài) → HTML/RSC phình ~440KB, chuyển trang chậm.
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .sort(
      (a, b) =>
        (b.meta.category === category ? 1 : 0) - (a.meta.category === category ? 1 : 0)
    )
    .slice(0, 12)
    .map((p) => ({
      slug: p.slug,
      meta: { title: p.meta.title, category: p.meta.category, thumbnail: p.meta.thumbnail },
    })) as unknown as UnifiedPost[];

  const pageUrl = `${SITE_URL}/${locale}/${category}/${slug}`;
  // Ảnh hero nén tại nguồn (Sanity/Unsplash transform) — w=1600 cho màn retina
  const heroThumb = optimizeThumbnail(
    post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    1600,
    65
  );
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: [heroThumb],
    datePublished: post.meta.publishedAt,
    dateModified: post.meta.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
    author: [{
      '@type': 'Person',
      name: typeof post.meta.author === 'string' ? post.meta.author : 'AI Editor',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'News Studio',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512x512.png` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <SingleArticleClient meta={{ ...post.meta, thumbnail: heroThumb }} slug={slug} allPosts={relatedPosts} content={post.content} body={post.body} />
    </>
  );
}
