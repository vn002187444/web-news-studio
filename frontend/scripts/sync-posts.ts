/**
 * Quét src/data/posts/*.mdx và nhúng toàn bộ vào src/data/posts-manifest.json.
 * Manifest được bundle vào JS nên Cloudflare Workers (không có fs ở runtime)
 * vẫn đọc được bài viết. Chạy sau mỗi lần autoblog và trước mỗi build.
 * Chạy: npm run sync-posts
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/data/posts');
const OUT_FILE = path.join(process.cwd(), 'src/data/posts-manifest.json');

interface ManifestPost {
  slug: string;
  meta: {
    title: string;
    excerpt: string;
    category: string;
    publishedAt: string;
    thumbnail: string;
    tags: string[];
    author: string;
    slug: string;
  };
  content: string;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.writeFileSync(OUT_FILE, '[]', 'utf8');
    console.log('[sync-posts] no posts dir, wrote empty manifest');
    return;
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
  const posts: ManifestPost[] = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      if (!data.title || !data.category || !data.publishedAt) {
        console.warn(`[sync-posts] skip ${file}: missing title/category/publishedAt`);
        continue;
      }
      posts.push({
        slug,
        meta: {
          title: String(data.title).slice(0, 200),
          excerpt: String(data.excerpt || '').slice(0, 500),
          category: String(data.category),
          publishedAt: String(data.publishedAt),
          thumbnail: String(data.thumbnail || ''),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          author: String(data.author || 'AI Editor'),
          slug: String(data.slug || slug),
        },
        content,
      });
    } catch (e) {
      console.warn(`[sync-posts] skip ${file}:`, (e as Error).message);
    }
  }
  posts.sort((a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime());
  fs.writeFileSync(OUT_FILE, JSON.stringify(posts), 'utf8');
  console.log(`[sync-posts] wrote ${posts.length} posts -> src/data/posts-manifest.json`);
}

main();
