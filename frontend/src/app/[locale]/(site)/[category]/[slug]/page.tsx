import { getPostUnified, getAllPostsUnified } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SingleArticleClient from './SingleArticleClient';
import { SITE_URL, absoluteUrl, escapeJsonLd } from '@/lib/site';

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

  const pageUrl = `${SITE_URL}/${locale}/${category}/${slug}`;
  const categoryUrl = `${SITE_URL}/${locale}/${category}`;
  const homeUrl = `${SITE_URL}/${locale}`;

  const articleJsonLd = {
    '@type': 'NewsArticle',
    '@id': `${pageUrl}#article`,
    headline: post.meta.title,
    description: post.meta.excerpt,
    image: [post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
    datePublished: post.meta.publishedAt,
    dateModified: post.meta.publishedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: locale === 'vi' ? 'vi-VN' : 'en-US',
    keywords: (post.meta.tags || []).join(', '),
    articleSection: category.toUpperCase(),
    // Tối ưu AEO / Trả lời bằng giọng nói & AI Overviews
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#article-content h2', '#article-content p'],
    },
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

  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'vi' ? 'Trang chủ' : 'Home',
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.toUpperCase(),
        item: categoryUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.meta.title,
        item: pageUrl,
      },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [articleJsonLd, breadcrumbJsonLd],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(JSON.stringify(jsonLd)) }}
      />
      <SingleArticleClient meta={post.meta} slug={slug} allPosts={allPosts} content={post.content} />
    </>
  );
}
