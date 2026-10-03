import { getPostUnified, getAllPostsUnified } from '@/lib/posts';
import { getAllPosts } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import SingleArticleClient from './SingleArticleClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; category: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostUnified(slug);
  
  if (!post) return {};
  
  const ogImageUrl = `https://news2026.example.com/api/og?title=${encodeURIComponent(post.meta.title)}&category=${encodeURIComponent(post.meta.category)}`;

  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    }
  };
}

// Prerender tĩnh mọi bài viết (đọc MDX lúc build — Cloudflare không có fs ở runtime)
export function generateStaticParams() {
  try {
    const posts = getAllPosts();
    return ['vi', 'en'].flatMap((locale) =>
      posts.map((p) => ({ locale, category: p.meta.category, slug: p.slug }))
    );
  } catch {
    return [];
  }
}

export default async function SingleArticlePage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params;
  const post = await getPostUnified(slug);
  const allPosts = await getAllPostsUnified(); // Sanity-first, MDX fallback

  if (!post || post.meta.category !== category) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.meta.title,
    image: [post.meta.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
    datePublished: post.meta.publishedAt,
    dateModified: post.meta.publishedAt,
    author: [{
      '@type': 'Person',
      name: post.meta.author || 'AI Editor',
      url: 'https://news-studio.exampl