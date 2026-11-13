import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = path.join(process.cwd(), 'frontend/src/data/posts');
const OUT_FILE = path.join(process.cwd(), 'frontend/src/data/posts-manifest.json');

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, content: raw };
  const endIdx = raw.indexOf('\n---', 3);
  if (endIdx === -1) return { data: {}, content: raw };

  const frontmatterStr = raw.slice(3, endIdx).trim();
  const content = raw.slice(endIdx + 4).trim();
  const data = {};

  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') && val.endsWith(']')) {
      try {
        val = JSON.parse(val);
      } catch {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    }
    data[key] = val;
  }

  return { data, content };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('No posts dir found at:', POSTS_DIR);
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'));
  const posts = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = parseFrontmatter(raw);

      if (!data.title || !data.category) {
        console.warn(`[sync] skip ${file}: missing title or category`);
        continue;
      }

      posts.push({
        slug,
        meta: {
          title: String(data.title).slice(0, 200),
          excerpt: String(data.excerpt || '').slice(0, 500),
          category: String(data.category),
          publishedAt: String(data.publishedAt || new Date().toISOString()),
          thumbnail: String(data.thumbnail || ''),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          author: String(data.author || 'AI Editor'),
          slug: String(data.slug || slug),
        },
        content,
      });
    } catch (e) {
      console.warn(`[sync] skip ${file}:`, e.message);
    }
  }

  posts.sort((a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime());
  fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`✅ [sync-manifest] Đã cập nhật thành công ${posts.length} bài viết vào posts-manifest.json`);
  
  const eduCount = posts.filter(p => p.meta?.category === 'education').length;
  const worldCount = posts.filter(p => p.meta?.category === 'world').length;
  console.log(`📊 Chuyên mục Giáo Dục (education): ${eduCount} bài viết.`);
  console.log(`📊 Chuyên mục Thế Giới (world): ${worldCount} bài viết.`);
}

main();
