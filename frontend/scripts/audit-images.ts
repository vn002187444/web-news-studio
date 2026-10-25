import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSanityClient } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function checkUrl(url: string, timeoutMs = 6000) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { ok: false, status: 0, reason: 'Invalid or empty URL' };
  }
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
    // Some servers return 405 or 403 for HEAD, try GET
    if (res.status === 405 || res.status === 403) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Range': 'bytes=0-1024'
        },
        signal: AbortSignal.timeout(timeoutMs)
      });
      return { ok: getRes.ok || getRes.status === 206, status: getRes.status };
    }
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, reason: err.message };
  }
}

async function auditImages() {
  console.log('==================================================');
  console.log('🔍 KIỂM TRA TOÀN DIỆN HÌNH ẢNH BÀI ĐĂNG (WEB NEWS)');
  console.log('==================================================\n');

  // 1. Kiểm tra Local Manifest
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  let localPosts: any[] = [];
  if (fs.existsSync(manifestPath)) {
    localPosts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  console.log(`📁 Tổng số bài viết trong Local Manifest: ${localPosts.length}`);

  const missingThumbLocal: any[] = [];
  const invalidThumbLocal: any[] = [];
  const brokenThumbLocal: any[] = [];

  // Group unique thumbnails to test efficiently
  const thumbUrlToPosts = new Map<string, any[]>();

  for (const post of localPosts) {
    const thumb = post.meta?.thumbnail || post.thumbnail?.url || post.thumbnail;
    const slug = post.slug || post.meta?.slug;
    const title = post.meta?.title || slug;
    const category = post.meta?.category || 'tech';

    if (!thumb || typeof thumb !== 'string' || thumb.trim() === '') {
      missingThumbLocal.push({ slug, title, category });
      continue;
    }

    const trimmed = thumb.trim();
    if (!trimmed.startsWith('http')) {
      invalidThumbLocal.push({ slug, title, category, thumb: trimmed });
      continue;
    }

    if (!thumbUrlToPosts.has(trimmed)) {
      thumbUrlToPosts.set(trimmed, []);
    }
    thumbUrlToPosts.get(trimmed)!.push({ slug, title, category });
  }

  console.log(`- Số bài thiếu thumbnail hoàn toàn: ${missingThumbLocal.length}`);
  console.log(`- Số bài có URL thumbnail không hợp lệ: ${invalidThumbLocal.length}`);
  console.log(`- Số URL thumbnail độc nhất cần test HTTP: ${thumbUrlToPosts.size}`);

  console.log('\n⏳ Đang kiểm tra HTTP status của các URL thumbnail (batch song song)...');
  const urls = Array.from(thumbUrlToPosts.keys());
  const BATCH_SIZE = 25;
  let checkedCount = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (u) => {
        const res = await checkUrl(u);
        return { url: u, ...res };
      })
    );

    for (const r of results) {
      if (!r.ok) {
        const affectedPosts = thumbUrlToPosts.get(r.url) || [];
        brokenThumbLocal.push({
          url: r.url,
          status: r.status,
          reason: r.reason,
          affectedCount: affectedPosts.length,
          posts: affectedPosts
        });
      }
    }
    checkedCount += batch.length;
    process.stdout.write(`  Đã kiểm tra: ${checkedCount}/${urls.length} URLs...\r`);
  }
  console.log(`\n✅ Hoàn tất kiểm tra HTTP của ${urls.length} thumbnail URLs local.`);

  // 2. Kiểm tra Sanity CMS
  console.log('\n--------------------------------------------------');
  console.log('📡 Đang kết nối Sanity CMS để kiểm tra hình ảnh...');
  let sanityArticles: any[] = [];
  const missingThumbSanity: any[] = [];
  const brokenThumbSanity: any[] = [];

  try {
    const sanity = getSanityClient(false);
    if (sanity) {
      sanityArticles = await sanity.fetch(
        `*[_type == "article"]{ _id, title, "slug": slug.current, category, thumbnail, "metaThumb": meta.thumbnail }`
      );
      console.log(`📊 Tổng số bài trên Sanity CMS: ${sanityArticles.length}`);

      const sanityUrlToPosts = new Map<string, any[]>();

      for (const a of sanityArticles) {
        const thumb = a.thumbnail || a.metaThumb;
        if (!thumb || typeof thumb !== 'string' || thumb.trim() === '') {
          missingThumbSanity.push({ id: a._id, slug: a.slug, title: a.title, category: a.category });
          continue;
        }

        const trimmed = thumb.trim();
        if (!trimmed.startsWith('http')) {
          missingThumbSanity.push({ id: a._id, slug: a.slug, title: a.title, category: a.category, thumb: trimmed });
          continue;
        }

        if (!sanityUrlToPosts.has(trimmed)) {
          sanityUrlToPosts.set(trimmed, []);
        }
        sanityUrlToPosts.get(trimmed)!.push(a);
      }

      console.log(`- Số bài Sanity thiếu thumbnail: ${missingThumbSanity.length}`);
      console.log(`- Số URL Sanity độc nhất cần kiểm tra: ${sanityUrlToPosts.size}`);

      const sUrls = Array.from(sanityUrlToPosts.keys());
      for (let i = 0; i < sUrls.length; i += BATCH_SIZE) {
        const batch = sUrls.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(async (u) => {
            const res = await checkUrl(u);
            return { url: u, ...res };
          })
        );
        for (const r of results) {
          if (!r.ok) {
            brokenThumbSanity.push({
              url: r.url,
              status: r.status,
              reason: r.reason,
              affectedCount: (sanityUrlToPosts.get(r.url) || []).length,
              posts: sanityUrlToPosts.get(r.url) || []
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Lỗi kiểm tra Sanity:', err.message);
  }

  // 3. TỔNG KẾT
  console.log('\n==================================================');
  console.log('📋 KẾT QUẢ KIỂM TOÁN HÌNH ẢNH:');
  console.log('==================================================');
  console.log(`1. Bài viết Local Manifest:`);
  console.log(`   - Thiếu thumbnail: ${missingThumbLocal.length} bài`);
  console.log(`   - Thumbnail không hợp lệ: ${invalidThumbLocal.length} bài`);
  console.log(`   - Thumbnail bị vỡ / lỗi mạng (HTTP != 200): ${brokenThumbLocal.length} URLs (ảnh hưởng ${brokenThumbLocal.reduce((s, b) => s + b.affectedCount, 0)} bài)`);

  if (brokenThumbLocal.length > 0) {
    console.log('\n❌ CHI TIẾT CÁC ẢNH LOCAL BỊ VỠ / LỖI HTTP:');
    brokenThumbLocal.forEach((b, idx) => {
      console.log(`\n[${idx + 1}] URL: ${b.url}`);
      console.log(`    Status: ${b.status} | Lý do: ${b.reason || 'HTTP Error'}`);
      console.log(`    Ảnh hưởng ${b.affectedCount} bài viết:`);
      b.posts.slice(0, 3).forEach((p: any) => console.log(`      - [${p.category}] ${p.title} (${p.slug})`));
      if (b.posts.length > 3) console.log(`      ... và ${b.posts.length - 3} bài khác`);
    });
  }

  if (missingThumbLocal.length > 0) {
    console.log('\n⚠️ CHI TIẾT BÀI THIẾU THUMBNAIL (LOCAL):');
    missingThumbLocal.forEach((p: any) => console.log(`  - [${p.category}] ${p.title} (${p.slug})`));
  }

  if (invalidThumbLocal.length > 0) {
    console.log('\n⚠️ CHI TIẾT BÀI CÓ THUMBNAIL KHÔNG HỢP LỆ (LOCAL):');
    invalidThumbLocal.forEach((p: any) => console.log(`  - [${p.category}] ${p.title} (${p.slug}) -> ${p.thumb}`));
  }

  console.log(`\n2. Bài viết Sanity CMS:`);
  console.log(`   - Thiếu thumbnail: ${missingThumbSanity.length} bài`);
  console.log(`   - Thumbnail bị vỡ / lỗi mạng: ${brokenThumbSanity.length} URLs (ảnh hưởng ${brokenThumbSanity.reduce((s, b) => s + b.affectedCount, 0)} bài)`);

  if (brokenThumbSanity.length > 0) {
    console.log('\n❌ CHI TIẾT CÁC ẢNH SANITY BỊ VỠ / LỖI HTTP:');
    brokenThumbSanity.forEach((b, idx) => {
      console.log(`\n[${idx + 1}] URL: ${b.url}`);
      console.log(`    Status: ${b.status} | Lý do: ${b.reason || 'HTTP Error'}`);
      console.log(`    Ảnh hưởng ${b.affectedCount} bài viết:`);
      b.posts.slice(0, 3).forEach((p: any) => console.log(`      - [${p.category}] ${p.title} (${p.slug})`));
    });
  }

  // Lưu báo cáo JSON để phân tích hoặc sửa tự động
  const report = {
    timestamp: new Date().toISOString(),
    local: {
      total: localPosts.length,
      missing: missingThumbLocal,
      invalid: invalidThumbLocal,
      broken: brokenThumbLocal
    },
    sanity: {
      total: sanityArticles.length,
      missing: missingThumbSanity,
      broken: brokenThumbSanity
    }
  };

  fs.writeFileSync('image-audit-report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('\n💾 Đã lưu kết quả chi tiết vào: frontend/image-audit-report.json');
}

auditImages().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
