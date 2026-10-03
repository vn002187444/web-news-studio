import { getAllPosts as getMdxPosts, getPostBySlug as getMdxPost, type PostMeta } from './mdx';
import { fetchSanityPosts, fetchSanityPost, type SanityArticle } from './sanity';

export interface UnifiedPost {
  slug: string;
  meta: PostMeta & { slug: string };
  content: string;
  source: 'sanity' | 'mdx';
}

function fromSanity(a: SanityArticle): UnifiedPost {
  return {
    slug: a.slug,
    meta: {
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      publishedAt: a.publishedAt,
      thumbnail: a.thumbnail,
      tags: a.tags || [],
      author: a.author || 'AI Editor',
      slug: a.slug,
    },
    content: a.content,
    source: 'sanity',
  };
}

function fromMdx(p: { slug: string; meta: PostMeta; content: string }): UnifiedPost {
  return { ...p, source: 'mdx' };
}

/** Sanity-first, MDX fallback. Chưa config Sanity → dùng MDX như cũ (build không vỡ). */
export async function getAllPostsUnified(): Promise<UnifiedPost[]> {
  const mdx = getMdxPosts().map(fromMdx);
  try {
    const sanity = await fetchSanityPosts();
    if (!sanity || sanity.length === 0) return mdx;
    const sanityPosts = sanity.map(fromSanity);
    const seen = new Set(sanityPosts.map((p) => p.slug));
    const onlyMdx = mdx.filter((p) => !seen.has(p.slug));
    return [...sanityPosts, ...onlyMdx].sort(
      (a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime()
    );
  } catch {
    return mdx;
  }
}

export async function getPostUnified(slug: string): Promise<UnifiedPost | null> {
  try {
    const s = await fetchSanityPost(slug);
    if (s) return fromSanity(s);
  } catch { /* fallback mdx */ }
  const m = getMdxPost(slug);
  return m ? fromMdx(m) : null;
}

export async function getPostsByCategoryUnified(category: string): Promise<UnifiedPost[]> {
  const all = await getAllPostsUnified();
  return all.filter((p) => p.meta.category.toLowerCase() === category.toLowerCase());
}

export async function searchPostsUnified(query: string): Promise<{ title: string; slug: string; category: string }[]> {
  const all = await getAllPostsUnified();
  const q = query.toLowerCase();
  if (!q) return all.slice(0, 10).map((p) => ({ title: p.meta.title, slug: p.slug, category: p.meta.category }));
  return all
    .filter(
      (p) =>
        p.meta.title.toLowerCase().includes(q) ||
        p.meta.excerpt?.toLowerCase().includes(q) ||
        p.meta.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .map((p) => ({ title: p.meta.title, slug: p.slug, category: p.meta.category }));
}
