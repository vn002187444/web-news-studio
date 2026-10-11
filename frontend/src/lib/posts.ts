import { getAllPosts as getMdxPosts, getPostBySlug as getMdxPost, type PostMeta } from './mdx';
import { fetchSanityPosts, fetchSanityPost, fetchSanityByCategory, type SanityArticle } from './sanity';
import { toSlug } from './site';
import { cache } from 'react';

export interface UnifiedPost {
  slug: string;
  meta: PostMeta & {
    slug: string;
    authorAvatar?: string;
    authorRole?: string;
    authorBio?: string;
    categoryIcon?: string;
    categoryColor?: string;
  };
  content: string;
  body?: any[]; // Portable Text (Sanity mới) — ưu tiên render
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
      author: a.authorDetail?.name || a.author || 'AI Editor',
      authorAvatar: a.authorDetail?.avatar || '',
      authorRole: a.authorDetail?.role || '',
      authorBio: a.authorDetail?.bio || '',
      categoryIcon: a.categoryDetail?.icon || '',
      categoryColor: a.categoryDetail?.color || '',
      slug: a.slug,
    },
    content: a.content,
    body: a.body,
    source: 'sanity',
  };
}

function fromMdx(p: { slug: string; meta: PostMeta; content: string }): UnifiedPost {
  return { ...p, source: 'mdx' };
}

/** Sanity-first, MDX fallback. Chưa config Sanity → dùng MDX như cũ (build không vỡ). */
export const getAllPostsUnified = cache(async (): Promise<UnifiedPost[]> => {
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
});

export async function getPostUnified(slug: string): Promise<UnifiedPost | null> {
  try {
    const s = await fetchSanityPost(slug);
    if (s) return fromSanity(s);
  } catch { /* fallback mdx */ }
  const m = getMdxPost(slug);
  return m ? fromMdx(m) : null;
}

export async function getPostsByCategoryUnified(category: string): Promise<UnifiedPost[]> {
  const cat = category.toLowerCase();
  try {
    const sanityOnly = await fetchSanityByCategory(cat);
    if (sanityOnly && sanityOnly.length > 0) {
      return sanityOnly.map(fromSanity).sort(
        (a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime()
      );
    }
  } catch { /* fallback merge */ }
  const all = await getAllPostsUnified();
  return all.filter((p) => p.meta.category.toLowerCase() === cat);
}

export async function searchPostsUnified(query: string, limit = 10): Promise<{ title: string; slug: string; category: string }[]> {
  const q = query.toLowerCase().trim().slice(0, 100);
  const all = await getAllPostsUnified();
  if (!q) return all.slice(0, limit).map((p) => ({ title: p.meta.title, slug: p.slug, category: p.meta.category }));
  return all
    .filter(
      (p) =>
        p.meta.title.toLowerCase().includes(q) ||
        p.meta.excerpt?.toLowerCase().includes(q) ||
        p.meta.tags?.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, limit)
    .map((p) => ({ title: p.meta.title, slug: p.slug, category: p.meta.category }));
}

/** Chuẩn hóa tag thành slug URL: "KBO League" → "kbo-league". */
export function tagToSlug(tag: string): string {
  return toSlug(tag);
}

/** Lấy bài theo tag (so khớp slug hóa, không phân biệt hoa thường). Tag không tồn tại → []. */
export async function getPostsByTagUnified(tagSlug: string): Promise<{ tag: string; posts: UnifiedPost[] }> {
  const slug = (tagSlug || '').toLowerCase().trim().slice(0, 80);
  const all = await getAllPostsUnified();
  const matched = all.filter((p) => (p.meta.tags || []).some((t) => tagToSlug(t) === slug));
  const tag = matched[0]?.meta.tags?.find((t) => tagToSlug(t) === slug) || tagSlug;
  return { tag, posts: matched };
}

/** Liệt kê mọi tag đang có bài (kèm số lượng) — dùng cho generateStaticParams + tag cloud. */
export async function getAllTagsUnified(): Promise<{ tag: string; slug: string; count: number }[]> {
  const all = await getAllPostsUnified();
  const map = new Map<string, { tag: string; count: number }>();
  for (const p of all) {
    for (const t of p.meta.tags || []) {
      const slug = tagToSlug(t);
      if (!slug) continue;
      const cur = map.get(slug);
      if (cur) cur.count++;
      else map.set(slug, { tag: t, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([slug, v]) => ({ ...v, slug }))
    .sort((a, b) => b.count - a.count);
}
