import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getCloudflareContext } from '@opennextjs/cloudflare';
// Lightweight metadata-only index (~743KB vs 7.6MB full manifest) to stay well under Workers CPU/RAM limits.
import postsIndex from '@/data/posts-index.json';

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

export interface PostMeta {
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  thumbnail: string;
  tags: string[];
  author: string;
  slug: string;
}

export interface MdxPost {
  slug: string;
  meta: PostMeta;
  content: string;
}

interface IndexEntry {
  slug: string;
  meta: PostMeta;
}

const typedIndex = postsIndex as IndexEntry[];
const indexBySlug = new Map<string, IndexEntry>();
for (const entry of typedIndex) {
  if (entry?.slug) {
    indexBySlug.set(entry.slug, entry);
  }
}

const sortedIndexPosts: MdxPost[] = [...typedIndex]
  .sort((a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime())
  .map((p) => ({ slug: p.slug, meta: p.meta, content: '' }));

let hasLocalPostsDirCache: boolean | null = null;
function hasLocalPostsDir(): boolean {
  if (hasLocalPostsDirCache !== null) return hasLocalPostsDirCache;
  try {
    hasLocalPostsDirCache = fs.existsSync(postsDirectory);
  } catch {
    hasLocalPostsDirCache = false;
  }
  return hasLocalPostsDirCache;
}

export function getPostSlugs() {
  if (hasLocalPostsDir()) {
    try {
      return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'));
    } catch {
      // Fallback to index
    }
  }
  return typedIndex.map((p) => `${p.slug}.mdx`);
}

export function getPostBySlug(slug: string): MdxPost | null {
  const realSlug = slug.replace(/\.mdx$/, '');
  if (hasLocalPostsDir()) {
    try {
      const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
      if (fs.existsSync(fullPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        return {
          slug: realSlug,
          meta: data as PostMeta,
          content,
        };
      }
    } catch {
      // Fall through to index lookup
    }
  }
  const hit = indexBySlug.get(realSlug);
  if (!hit) return null;
  return { slug: hit.slug, meta: hit.meta, content: '' };
}

/**
 * Async post loader: reads .mdx from disk in Node.js builds/dev,
 * or fetches per-article JSON from Cloudflare Static Assets (env.ASSETS) at Worker runtime.
 */
export async function getPostBySlugAsync(slug: string): Promise<MdxPost | null> {
  const realSlug = slug.replace(/\.mdx$/, '');

  if (hasLocalPostsDir()) {
    const localPost = getPostBySlug(realSlug);
    if (localPost && localPost.content) return localPost;
  }

  const safeSlug = realSlug.replace(/[^a-zA-Z0-9._-]/g, '');
  if (safeSlug) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      if (env?.ASSETS) {
        const res = await env.ASSETS.fetch(new Request(`https://assets.local/data/posts/${safeSlug}.json`));
        if (res.ok) {
          const parsed = (await res.json()) as MdxPost;
          if (parsed?.slug) return parsed;
        }
      }
    } catch {
      // Fallback to metadata entry if ASSETS binding is unavailable
    }
  }

  const hit = indexBySlug.get(realSlug);
  if (!hit) return null;
  return { slug: hit.slug, meta: hit.meta, content: '' };
}

export function getAllPosts(): MdxPost[] {
  return sortedIndexPosts;
}

// Lọc bài viết theo Chuyên Mục (Tech, Web3, Game...)
export function getPostsByCategory(category: string) {
  const cat = category.toLowerCase();
  return sortedIndexPosts.filter((post) => post.meta.category.toLowerCase() === cat);
}

// Giả lập Thuật toán lấy Tin Xu Hướng (Trending / Hot News)
export function getTrendingPosts(limit: number = 3) {
  return sortedIndexPosts.slice(0, limit);
}
