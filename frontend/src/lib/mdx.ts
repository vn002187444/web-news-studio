import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// Manifest nhúng sẵn: bundle vào JS nên Workers (không có fs ở runtime) vẫn đọc được.
import manifestPosts from '@/data/posts-manifest.json';

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

export function getPostSlugs() {
  try {
    if (!fs.existsSync(postsDirectory)) throw new Error('no-posts-dir');
    return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
  } catch {
    // Runtime không có fs (Cloudflare Workers): dùng manifest nhúng sẵn
    return (manifestPosts as { slug: string }[]).map((p) => `${p.slug}.mdx`);
  }
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  try {
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      throw new Error('not-on-disk');
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      meta: data as PostMeta,
      content,
    };
  } catch {
    // Fallback manifest cho Workers runtime
    const hit = (manifestPosts as { slug: string; meta: PostMeta; content: string }[]).find((p) => p.slug === realSlug);
    if (!hit) return null;
    return { slug: hit.slug, meta: hit.meta, content: hit.content };
  }
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(Boolean) as { slug: string; meta: PostMeta; content: string }[];
    
  return posts.sort((post1, post2) => {
    return new Date(post1.meta.publishedAt).getTime() > new Date(post2.meta.publishedAt).getTime() ? -1 : 1;
  });
}

// Lọc bài viết theo Chuyên Mục (Tech, Web3, Game...)
export function getPostsByCategory(category: string) {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.meta.category.toLowerCase() === category.toLowerCase());
}

// Giả lập Thuật toán lấy Tin Xu Hướng (Trending / Hot News)
export function getTrendingPosts(limit: number = 3) {
  const allPosts = getAllPosts();
  // Ở môi trường thực tế, ta có thể lọc dựa trên `meta.views` hoặc thuật toán AI chấm điểm.
  // Tạm thời ta xáo trộn ngẫu nhiên một chút hoặc lấy top đầu để làm tin nổi bật
  return allPosts.slice(0, limit); 
}

