/**
 * Sync 77 local World (Thế Giới) posts to Sanity Studio CMS
 * Usage: npx tsx scripts/sync-world-to-sanity.ts
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@sanity/client';
import { markdownToBlocks } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'cb3cdnq7';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN || '';
const apiVersion = process.env.SANITY_API_VERSION || '2026-01-01';

if (!projectId || !token) {
  console.error('⚠️ Thiếu SANITY_API_TOKEN hoặc SANITY_PROJECT_ID. Vui lòng cung cấp SANITY_API_TOKEN trong .env.local hoặc GitHub Secrets.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function main() {
  console.log('🚀 Bắt đầu quy trình đồng bộ chuyên mục Thế Giới (world) lên Sanity Studio...');

  // 1. Tạo tác giả & danh mục taxonomy cho world
  console.log('1. Đảm bảo Taxonomy (Tác giả & Danh mục) cho Thế Giới tồn tại...');
  await client.createOrReplace({
    _type: 'author',
    _id: 'author-world',
    name: 'Minh Trí',
    slug: { _type: 'slug', current: 'minh-tri' },
    role: 'Biên tập viên Thời sự Quốc tế',
    bio: 'Ngoại giao, địa chính trị và phân tích diễn biến thế giới từ các nguồn tin quốc tế uy tín.',
    avatar: 'https://i.pravatar.cc/150?u=world-editor',
    beats: ['world'],
  });
  console.log('  ✅ author-world: Minh Trí');

  await client.createOrReplace({
    _type: 'categoryDoc',
    _id: 'category-world',
    title: 'Thế Giới',
    value: 'world',
    description: 'Thời sự quốc tế, địa chính trị và tin tức toàn cầu cập nhật 24/7.',
    icon: '🌍',
    color: '#2563EB',
  });
  console.log('  ✅ category-world: Thế Giới 🌍');

  // 2. Nạp toàn bộ 77 bài local
  console.log('\n2. Nạp danh sách bài viết chuyên mục Thế Giới...');
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Không tìm thấy src/data/posts-manifest.json');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const worldPosts = manifest.filter((p: any) => p.meta?.category === 'world');
  console.log(`📊 Tìm thấy ${worldPosts.length} bài viết chuyên mục 'world'.`);

  // 3. Đẩy từng bài lên Sanity
  let successCount = 0;
  for (let i = 0; i < worldPosts.length; i++) {
    const post = worldPosts[i];
    const slug = post.slug;
    const body = markdownToBlocks(post.content || '');

    const doc = {
      _type: 'article',
      _id: `article-${slug}`,
      title: post.meta.title,
      slug: { _type: 'slug', current: slug },
      excerpt: post.meta.excerpt,
      content: post.content,
      body,
      category: 'world',
      tags: post.meta.tags || ['Thế Giới', 'Quốc Tế'],
      thumbnail: post.meta.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
      author: post.meta.author || 'Ban Biên Tập News Studio',
      authorRef: { _type: 'reference', _ref: 'author-world' },
      categoryRef: { _type: 'reference', _ref: 'category-world' },
      publishedAt: post.meta.publishedAt || new Date().toISOString(),
    };

    try {
      await client.createOrReplace(doc);
      successCount++;
      if (successCount % 10 === 0 || successCount === worldPosts.length) {
        console.log(`  [${successCount}/${worldPosts.length}] Đã đồng bộ: ${post.meta.title.slice(0, 45)}...`);
      }
    } catch (err: any) {
      console.error(`  ❌ Lỗi bài ${slug}:`, err.message);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã đồng bộ thành công ${successCount}/${worldPosts.length} bài lên Sanity Studio.`);
}

main().catch((err) => {
  console.error('Fatal Sync Error:', err);
  process.exit(1);
});
