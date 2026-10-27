import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSanityClient, isSanityConfigured } from '../src/lib/sanity';
import { CURATED_THUMBNAIL_POOL } from '../src/lib/image-processor';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCuratedThumbnail(category: string, slug: string): string {
  const cat = (category || 'tech').toLowerCase();
  const pool = CURATED_THUMBNAIL_POOL[cat] || CURATED_THUMBNAIL_POOL.tech;
  const index = slug ? hashSlug(slug) % pool.length : 0;
  return `${pool[index]}?auto=format&fit=crop&w=1200&q=75`;
}

async function fixAllBrokenThumbnails() {
  console.log('========================================================');
  console.log('🛠️ BẮT ĐẦU SỬA CHỮA TOÀN DIỆN BROKEN THUMBNAILS (WEB NEWS)');
  console.log('========================================================\n');

  const reportPath = path.join(process.cwd(), 'image-audit-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Không tìm thấy image-audit-report.json. Vui lòng chạy audit-images.ts trước!');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  // Thu thập danh sách slug và url bị vỡ ở Local
  const brokenLocalUrls = new Set<string>();
  const brokenLocalSlugs = new Map<string, { title: string; category: string }>();

  for (const item of report.local.broken || []) {
    brokenLocalUrls.add(item.url);
    for (const post of item.posts || []) {
      brokenLocalSlugs.set(post.slug, { title: post.title, category: post.category });
    }
  }

  console.log(`📊 Local: Tìm thấy ${brokenLocalUrls.size} broken URLs ảnh hưởng ${brokenLocalSlugs.size} bài viết.`);

  // 1. Cập nhật Local Manifest
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  let localPosts: any[] = [];
  let manifestUpdatedCount = 0;

  if (fs.existsSync(manifestPath)) {
    localPosts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const post of localPosts) {
      const slug = post.slug || post.meta?.slug;
      const currentThumb = post.meta?.thumbnail || post.thumbnail?.url || post.thumbnail;

      const isBroken = brokenLocalSlugs.has(slug) || (currentThumb && brokenLocalUrls.has(currentThumb));
      if (isBroken) {
        const category = post.meta?.category || brokenLocalSlugs.get(slug)?.category || 'tech';
        const newThumb = getCuratedThumbnail(category, slug);

        if (!post.meta) post.meta = {};
        post.meta.thumbnail = newThumb;

        if (typeof post.thumbnail === 'string') {
          post.thumbnail = newThumb;
        } else if (post.thumbnail && typeof post.thumbnail === 'object') {
          post.thumbnail.url = newThumb;
        }

        manifestUpdatedCount++;
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(localPosts, null, 2), 'utf8');
    console.log(`✅ Đã cập nhật ${manifestUpdatedCount} bài viết trong src/data/posts-manifest.json.`);
  }

  // 2. Cập nhật Frontmatter trong các file .mdx
  const postsDir = path.join(process.cwd(), 'src/data/posts');
  let mdxUpdatedCount = 0;

  if (fs.existsSync(postsDir)) {
    for (const [slug, meta] of brokenLocalSlugs.entries()) {
      const mdxPath = path.join(postsDir, `${slug}.mdx`);
      if (fs.existsSync(mdxPath)) {
        let content = fs.readFileSync(mdxPath, 'utf8');
        const newThumb = getCuratedThumbnail(meta.category, slug);

        // Regex thay thế thumbnail trong Frontmatter
        if (/^thumbnail:\s*["'].*?["']/m.test(content)) {
          content = content.replace(/^thumbnail:\s*["'].*?["']/m, `thumbnail: "${newThumb}"`);
          fs.writeFileSync(mdxPath, content, 'utf8');
          mdxUpdatedCount++;
        } else if (/^thumbnail:\s*\S+/m.test(content)) {
          content = content.replace(/^thumbnail:\s*\S+/m, `thumbnail: "${newThumb}"`);
          fs.writeFileSync(mdxPath, content, 'utf8');
          mdxUpdatedCount++;
        }
      }
    }
    console.log(`✅ Đã cập nhật frontmatter của ${mdxUpdatedCount} tệp .mdx trong src/data/posts/.`);
  }

  // 3. Cập nhật Sanity CMS
  console.log('\n--------------------------------------------------------');
  console.log('📡 TIẾN HÀNH CẬP NHẬT TRÊN SANITY CMS...');
  console.log('--------------------------------------------------------');

  if (!isSanityConfigured()) {
    console.warn('⚠️ Sanity chưa cấu hình Project ID hoặc Write Token. Bỏ qua Sanity patch.');
  } else {
    const writeClient = getSanityClient(true);
    if (!writeClient) {
      console.warn('⚠️ Không lấy được writeClient Sanity. Kiểm tra SANITY_API_TOKEN.');
    } else {
      const brokenSanityPosts: any[] = [];
      for (const item of report.sanity.broken || []) {
        for (const p of item.posts || []) {
          brokenSanityPosts.push(p);
        }
      }

      console.log(`📋 Tổng số bài viết Sanity cần cập nhật: ${brokenSanityPosts.length}`);
      let sanityUpdatedCount = 0;

      for (let i = 0; i < brokenSanityPosts.length; i++) {
        const p = brokenSanityPosts[i];
        const newThumb = getCuratedThumbnail(p.category || 'tech', p.slug);

        try {
          await writeClient
            .patch(p._id)
            .set({
              thumbnail: newThumb,
              'meta.thumbnail': newThumb
            })
            .commit();

          sanityUpdatedCount++;
          console.log(`  [${i + 1}/${brokenSanityPosts.length}] Đã sửa Sanity Doc: ${p._id} (${p.slug})`);
        } catch (err: any) {
          console.error(`  ❌ Lỗi khi sửa doc ${p._id}:`, err.message);
        }
      }

      console.log(`\n🎉 Hoàn tất cập nhật Sanity CMS: ${sanityUpdatedCount}/${brokenSanityPosts.length} bài đã sửa.`);
    }
  }

  console.log('\n========================================================');
  console.log('🏁 TỔNG KẾT HOÀN TẤT:');
  console.log(`- Local Manifest bài đã sửa: ${manifestUpdatedCount}`);
  console.log(`- File .mdx đã sửa: ${mdxUpdatedCount}`);
  console.log('========================================================\n');
}

fixAllBrokenThumbnails().catch((err) => {
  console.error('Fatal error in fix script:', err);
  process.exit(1);
});
