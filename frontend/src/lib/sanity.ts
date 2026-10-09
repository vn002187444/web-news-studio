import { createClient, type SanityClient } from '@sanity/client';
import { PortableTextBlock, PortableTextSpan, PortableTextMarkDefinition } from '@portabletext/types';

function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
  const apiVersion = process.env.SANITY_API_VERSION || '2026-01-01';
  const token = process.env.SANITY_API_TOKEN || '';
  return { projectId, dataset, apiVersion, token };
}

export function isSanityConfigured(): boolean {
  const { projectId, token } = getSanityConfig();
  return Boolean(projectId && token);
}

let publicClient: SanityClient | null = null;
let writeClient: SanityClient | null = null;

export function getSanityClient(withToken = false): SanityClient | null {
  const { projectId, dataset, apiVersion, token } = getSanityConfig();
  if (!projectId) return null;
  if (withToken) {
    if (!token) return null;
    if (!writeClient) {
      writeClient = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token,
        perspective: 'published',
      });
    }
    return writeClient;
  }
  if (!publicClient) {
    publicClient = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    });
  }
  return publicClient;
}

export interface SanityArticle {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown (cũ — fallback)
  body?: PortableTextBlock[]; // Portable Text (mới — ưu tiên render)
  category: 'tech' | 'blockchain' | 'game' | 'finance' | 'lifestyle' | 'sports' | 'entertainment' | 'education' | 'science';
  tags: string[];
  thumbnail: string;
  author: string;
  publishedAt: string;
  authorDetail?: { name: string; role?: string; bio?: string; avatar?: string } | null;
  categoryDetail?: { title: string; icon?: string; color?: string } | null;
}

const LIST_QUERY = `*[_type == "article" && defined(slug.current)] | order(publishedAt desc) [0...100] {
  _id,
  "slug": slug.current,
  title, excerpt, content, body, category, tags, thumbnail, author, publishedAt, "authorDetail": authorRef->{name, role, bio, avatar}, "categoryDetail": categoryRef->{title, icon, color}
}`;

const BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  title, excerpt, content, body, category, tags, thumbnail, author, publishedAt, "authorDetail": authorRef->{name, role, bio, avatar}, "categoryDetail": categoryRef->{title, icon, color}
}`;

const BY_CATEGORY_QUERY = `*[_type == "article" && category == $category] | order(publishedAt desc) [0...50] {
  _id,
  "slug": slug.current,
  title, excerpt, content, body, category, tags, thumbnail, author, publishedAt, "authorDetail": authorRef->{name, role, bio, avatar}, "categoryDetail": categoryRef->{title, icon, color}
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

/** Chuyển markdown (bot AI sinh) sang Portable Text blocks để lưu field `body`. */
export function markdownToBlocks(md: string): PortableTextBlock[] {
  const key = () => Math.random().toString(36).slice(2, 10);

  interface TempSpan extends Omit<PortableTextSpan, '_type'> {
    _type: "span";
    _href?: string;
  }

  const parseSpans = (text: string): { children: PortableTextSpan[], markDefs: PortableTextMarkDefinition[] } => {
    const children: TempSpan[] = [];
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    const pushText = (t: string, mark?: string) => {
      if (!t) return;
      children.push({ _type: 'span', _key: key(), text: t, marks: mark ? [mark] : [] });
    };
    let li = 0;
    while ((m = linkRe.exec(text)) !== null) {
      pushText(text.slice(last, m.index));
      children.push({
        _type: 'span', _key: key(), text: m[1],
        marks: [`link-${li++}-${key()}`],
      });
      last = m.index + m[0].length;
      // lưu tạm href vào def
      children[children.length - 1]._href = m[2];
    }
    pushText(text.slice(last));

    const defs = children.filter((c) => c._href).map((c) => {
      const d = { _type: 'link', _key: c.marks![0], href: c._href };
      delete c._href;
      return d;
    }) as unknown as PortableTextMarkDefinition[];

    return { children: children as PortableTextSpan[], markDefs: defs };
  };

  const blocks: PortableTextBlock[] = [];
  for (const rawLine of (md || '').split('\n')) {
    const line = rawLine.trim();
    if (!line || line === '---') continue;
    if (line.startsWith('### ')) {
      const { children, markDefs } = parseSpans(line.slice(4));
      blocks.push({ _type: 'block', _key: key(), style: 'h3', children, markDefs });
    } else if (line.startsWith('## ')) {
      const { children, markDefs } = parseSpans(line.slice(3));
      blocks.push({ _type: 'block', _key: key(), style: 'h2', children, markDefs });
    } else if (/^[-*]\s+/.test(line)) {
      const { children, markDefs } = parseSpans(line.replace(/^[-*]\s+/, ''));
      blocks.push({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, children, markDefs });
    } else {
      const { children, markDefs } = parseSpans(line.replace(/^\d+\.\s+/, ''));
      if (children.length === 0) continue;
      blocks.push({ _type: 'block', _key: key(), style: 'normal', children, markDefs });
    }
  }
  return blocks;
}

/** Ghi bài AI lên Sanity — dùng trong scripts/autoblog.ts (cần SANITY_API_TOKEN). */
export async function pushArticleToSanity(doc: Omit<SanityArticle, '_id'>): Promise<boolean> {
  const c = getSanityClient(true);
  if (!c) return false;
  try {
    const body = doc.body && doc.body.length > 0 ? doc.body : markdownToBlocks(doc.content || '');
    const cat = (doc.category || 'tech') as string;
    const refs: any = {};
    // Seed S3 dùng _id cố định author-<cat> / category-<cat>
    refs.authorRef = { _type: 'reference', _ref: `author-${cat}` };
    refs.categoryRef = { _type: 'reference', _ref: `category-${cat}` };
    const existing = await c.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug: doc.slug });
    if (existing) {
      await c.patch(existing).set({ ...doc, body, ...refs, slug: undefined }).commit();
      return true;
    }
    await c.create({
      _type: 'article',
      _id: `article-${doc.slug}`,
      title: doc.title,
      slug: { _type: 'slug', current: doc.slug },
      excerpt: doc.excerpt,
      content: doc.content,
      body,
      ...refs,
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
