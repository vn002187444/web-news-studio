import dotenv from 'dotenv';
import path from 'path';
import Parser from 'rss-parser';
import { getSanityClient } from '../src/lib/sanity';
import fs from 'fs';
import { RSS_FEEDS } from '../src/data/rss-feeds';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function checkSystem() {
  console.log('==============================================');
  console.log('🔍 KIỂM TRA BẢO TRÌ & VẬN HÀNH WEBSITE NEWS');
  console.log('==============================================\n');

  // 1. Kiểm tra Biến môi trường
  console.log('1. [Cấu hình Môi Trường]');
  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MOCK_KEY';
  const hasSanityId = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const hasSanityToken = !!process.env.SANITY_API_TOKEN;
  console.log(`- Gemini API Key: ${hasGemini ? '✅ Hoạt động (' + (process.env.GEMINI_MODEL || 'gemini-3.8-flash') + ')' : '❌ Chưa cấu hình hoặc dùng Mock'}`);
  console.log(`- Sanity Project ID: ${hasSanityId ? '✅ ' + process.env.NEXT_PUBLIC_SANITY_PROJECT_ID : '❌ Chưa cấu hình'}`);
  console.log(`- Sanity Token: ${hasSanityToken ? '✅ Đã cấp token' : '❌ Chưa có'}`);

  // 2. Kiểm tra Sanity Database
  console.log('\n2. [Kết nối Sanity CMS]');
  try {
    const sanity = getSanityClient(false);
    if (!sanity) {
      console.log('⚠️ Sanity Client không khởi tạo được.');
    } else {
      const articles: any[] = await sanity.fetch(`*[_type == "article"]{ title, category, views, "slug": slug.current, publishedAt }`);
      console.log(`✅ Sanity kết nối thành công! Tổng số bài trên CMS: ${articles.length}`);
      const catCount: Record<string, number> = {};
      let totalViews = 0;
      articles.forEach((a) => {
        catCount[a.category] = (catCount[a.category] || 0) + 1;
        totalViews += (a.views || 0);
      });
      console.log(`- Phân bố bài viết theo chuyên mục trên Sanity:`, catCount);
      console.log(`- Tổng lượt xem tích lũy trên Sanity: ${totalViews}`);
      if (articles.length > 0) {
        console.log(`- 3 bài mới nhất trên Sanity:`);
        articles.slice(0, 3).forEach((a, i) => {
          console.log(`  ${i + 1}. [${a.category}] ${a.title?.slice(0, 50)}... (${a.views || 0} views)`);
        });
      }
    }
  } catch (err: any) {
    console.error('❌ Lỗi kết nối Sanity:', err.message);
  }

  // 3. Kiểm tra Local MDX Posts & Manifest
  console.log('\n3. [Kho dữ liệu tĩnh Local MDX]');
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`✅ File manifest tồn tại. Tổng số bài: ${manifest.length}`);
    const localCatCount: Record<string, number> = {};
    manifest.forEach((m: any) => {
      localCatCount[m.meta.category] = (localCatCount[m.meta.category] || 0) + 1;
    });
    console.log(`- Phân bố bài viết local:`, localCatCount);
  } else {
    console.log('⚠️ Không tìm thấy src/data/posts-manifest.json');
  }

  // 4. Kiểm tra các nguồn RSS Feed
  console.log(`\n4. [Kiểm tra ${RSS_FEEDS.length} Nguồn RSS Feed Quốc Tế & Trong Nước]`);
  const parser = new Parser({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 8000
  });

  for (const feed of RSS_FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);
      const itemCount = data.items?.length || 0;
      const latest = data.items?.[0]?.title || 'Không có tiêu đề';
      console.log(`✅ [${feed.category.toUpperCase()}] [${feed.country}] ${feed.name}: OK (${itemCount} tin) | Mới nhất: "${latest.slice(0, 45)}..."`);
    } catch (err: any) {
      console.log(`❌ [${feed.category.toUpperCase()}] [${feed.country}] ${feed.name}: Lỗi tải RSS (${err.message})`);
    }
  }

  console.log('\n==============================================');
  console.log('🏁 HOÀN TẤT KIỂM TRA');
  console.log('==============================================');
}

checkSystem();
