import { createClient, type SanityClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2026-01-01';
// Token chỉ dùng phía server (autoblog / route). Không prefix NEXT_PUBLIC.
const token = process.env.SANITY_API_TOKEN || '';

export const isSanityConfigured = Boolean(projectId && token);

let client: SanityClient | null = null;

export function getSanityClient(withToken = false): SanityClient | null {
  if (!projectId) return null;
  if (withToken && !token) return null;
  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !withToken, // read công khai dùng CDN, write dùng token không CDN
      token: withToken ? token : undefined,
      perspective: 'published',
    });
  }
  return client;
}

export interface SanityArticle {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown
  category: 'tech' | 'blockchain' | 'game' | 'finance' | 'lifestyle' | 'sports' | 'entertainment' | 'education' | 'science';
  tags: string[];
  thumbnail: string;
  author: string;
  publishedAt: string;
}

const LIST_QUERY = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) [0...100] {
  _id,
  "slug": slug.current,
  title, excerpt, content, category, tags, thumbnail, author, publishedAt
}`;

const BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  title, excerpt, content, category, tags, thumbnail, author, publishedAt
}`;

const BY_CATEGORY_QUERY = `*[_type == "article" && category == $category] | order(publishedAt desc) [0...50] {
  _id,
  "slug": slug.current,
  title, excerpt, content, category, tags, thumbnail, author, publishedAt
}`;

export async function fetchSanityPosts(): Promise<SanityArticle[] | null> {
  const c = getSanityClient(false);
  if (!c) return null;
  try {
    return await c.fetch<SanityArticle[]>(LIST_QUERY);
  } catch (e) {
    console.error('[sanity] fetch posts failed, fallback MDX:', e);
    return null;
  }
}

export async function fetchSanityPost(slug: string): Promise<SanityArticle | null> {
  const c = getSanityClient(false);
  if (!c) return null;
  try {
    return await c.fetch<SanityArticle | null>(BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function fetchSanityByCategory(category: string): Promise<SanityArticle[] | null> {
  const c = getSanityClient(false);
  if (!c) return null;
  try {
    return await c.fetch<SanityArticle[]>(BY_CATEGORY_QUERY, { category });
  } catch {
    return null;
  }
}

/** Ghi bài AI lên Sanity — dùng trong scripts/autoblog.ts (cần SANITY_API_TOKEN). */
export async function pushArticleToSanity(doc: Omit<SanityArticle, '_id'>): Promise<boolean> {
  const c = getSanityClient(true);
  if (!c) return false;
  try {
    const existing = await c.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug: doc.slug });
    if (existing) {
      await c.patch(existing).set({ ...doc, slug: undefined }).commit();
      return true;
    }
    await c.create({
      _type: 'article',
      _id: `article-${doc.slug}`,
      title: doc.title,
      slug: { _type: 'slug', current: doc.slug },
      excerpt: doc.excerpt,
      content: doc.content,
      category: doc.category,
      tags: doc.tags,
      thumbnail: doc.thumbnail,
      author: doc.author,
      publishedAt: doc.publishedAt,
    });
    return true;
  } catch (e) {
    console.error('[sanity] push failed:', e);
    return false;
  }
}
