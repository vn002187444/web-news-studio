import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { pushArticleToSanity } from '../src/lib/sanity';

// MOCK: In production, pass via process.env.GEMINI_API_KEY
// Assuming the user runs this script when needed. We will simulate the behavior if no key is present.
const API_KEY = process.env.GEMINI_API_KEY || 'MOCK_KEY'; 

const parser = new Parser();
const genAI = new GoogleGenerativeAI(API_KEY);

const RSS_FEEDS = [
  // Vietnam
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://thanhnien.vn/rss/game.rss', category: 'game' },
  
  // US / Global
  { url: 'https://techcrunch.com/feed/', category: 'tech' },
  { url: 'https://cointelegraph.com/rss', category: 'blockchain' },
  
  // China (English/Global)
  { url: 'https://www.scmp.com/rss/91/feed', category: 'tech' },
  
  // Japan
  { url: 'https://japantoday.com/feed/category/tech', category: 'tech' },
  
  // Korea
  { url: 'https://en.yna.co.kr/RSS/news.xml', category: 'tech' },
  
  // New Categories
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' }
];

const POSTS_DIR = path.join(process.cwd(), 'src/data/posts');

async function rewriteArticle(title: string, content: string, category: string) {
  // ... (giữ nguyên hàm rewriteArticle)
  if (API_KEY === 'MOCK_KEY') {
    console.log('[MOCK] No API Key found, skipping Gemini API call. Returning mock rewritten content.');
    return {
      title: `(AI Dịch) ${title}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      excerpt: "Bản tóm tắt tự động bằng tiếng Việt do AI tạo ra từ bài báo gốc nước ngoài. Phân tích chuyên sâu các điểm chính.",
      content: `## Những điểm chính (Key Takeaways)\n- Điểm đáng chú ý thứ nhất từ bài báo\n- Điểm đáng chú ý thứ hai về công nghệ/tài chính\n\nĐộ dài bài viết gốc: ${content?.length || 0} ký tự. (Đây là nội dung mô phỏng bằng Tiếng Việt do chưa cấu hình GEMINI_API_KEY. Khi có Key thật, AI sẽ tự động dịch và viết lại toàn bộ nội dung từ tiếng Anh/Trung/Nhật/Hàn sang Tiếng Việt chuẩn SEO).`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an elite Tech Journalist and SEO Expert. 
      Rewrite the following article to be 100% unique (avoid plagiarism).
      
      Original Title: ${title}
      Original Content (Snippet/HTML): ${content}
      
      REQUIREMENTS:
      1. MUST output the article in VIETNAMESE language, regardless of the source language.
      2. Create a catchy, click-worthy Title in Vietnamese.
      3. Generate an SEO-friendly URL slug in English or unaccented Vietnamese (kebab-case).
      4. Write a 1-2 sentence excerpt/meta description in Vietnamese.
      5. Format the content in Markdown (.mdx).
      6. Include a "## Những điểm chính (Key Takeaways)" section at the top (AEO Optimization).
      7. Include dummy internal links formatting like [text](/tech/some-slug) (SEO Optimization).
      8. Do not hallucinate facts. Maintain the original core news.
      
      Output the result STRICTLY as a JSON object with this schema:
      {
        "title": "String",
        "slug": "String",
        "excerpt": "String",
        "content": "String (Markdown format)"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    return null;
  }
}

// Hàm Sleep để tránh Rate Limit API & Quá tải CPU
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const LOCK_FILE = path.join(process.cwd(), 'autoblog.lock');

async function runAutoblogger() {
  // CƠ CHẾ CHỐNG QUÁ TẢI 1: Kiểm tra Lock File
  if (fs.existsSync(LOCK_FILE)) {
    console.warn('⚠️ CẢNH BÁO: Tiến trình Autoblog trước đó vẫn đang chạy (Tồn tại file autoblog.lock). Hủy bỏ lượt chạy này để tránh nghẽn Server.');
    process.exit(1);
  }

  // Khởi tạo Lock File
  fs.writeFileSync(LOCK_FILE, 'RUNNING', 'utf8');
  console.log('🤖 AI Autoblogger Started... (Lock file created)');

  let articlesProcessed = 0;
  const MAX_ARTICLES_PER_RUN = 5; // CƠ CHẾ CHỐNG QUÁ TẢI 2: Giới hạn số lượng bài mỗi lần Cron chạy

  try {
    for (const feed of RSS_FEEDS) {
      if (articlesProcessed >= MAX_ARTICLES_PER_RUN) {
        console.log(`🛑 Đạt giới hạn an toàn tối đa (${MAX_ARTICLES_PER_RUN} bài/lượt). Tạm dừng để nhường tài nguyên hệ thống.`);
        break;
      }

      console.log(`📡 Fetching RSS: ${feed.url}`);
      try {
        const feedData = await parser.parseURL(feed.url);
        
        const latestItem = feedData.items[0];
        if (!latestItem) continue;

        // CƠ CHẾ CHỐNG QUÁ TẢI 3: Kiểm tra bài viết đã tồn tại chưa TRƯỚC KHI gọi AI
        const tempSlug = latestItem.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || '';
        const tempFilePath = path.join(POSTS_DIR, `${tempSlug}.mdx`);
        
        // Đoạn này dùng approximate check. Nếu title không đổi, AI sinh slug sẽ giống nhau.
        // Bỏ qua nếu có dấu hiệu bài đã tồn tại để tiết kiệm tiền API Gemini.
        if (fs.existsSync(tempFilePath)) {
           console.log(`⏩ [Cache Check] Bài báo có vẻ đã tồn tại, bỏ qua gọi AI.`);
           continue;
        }

        console.log(`📰 Found article: ${latestItem.title}`);
        
        // Bóc tách hình ảnh từ RSS
        let extractedThumbnail = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
        if (latestItem.enclosure && latestItem.enclosure.url) {
          extractedThumbnail = latestItem.enclosure.url;
        } else {
          const imgMatch = (latestItem.content || latestItem.contentSnippet || '').match(/<img[^>]+src="?([^"\s]+)"?\s*/i);
          if (imgMatch && imgMatch[1]) {
            extractedThumbnail = imgMatch[1];
          }
        }

        console.log('✨ Rewriting and Optimizing with Gemini AI (GEO/AEO)...');
        
        const rewritten = await rewriteArticle(latestItem.title!, latestItem.content || latestItem.contentSnippet || '', feed.category);
        
        if (!rewritten) continue;

        const mdxContent = `---
title: "${rewritten.title.replace(/"/g, '\\"')}"
excerpt: "${rewritten.excerpt.replace(/"/g, '\\"')}"
category: "${feed.category}"
publishedAt: "${new Date().toISOString()}"
thumbnail: "${extractedThumbnail}"
tags: ["AI", "AutoBlogger", "News"]
author: "AI Autobot"
slug: "${rewritten.slug}"
---

${rewritten.content}
`;

        const filePath = path.join(POSTS_DIR, `${rewritten.slug}.mdx`);
        
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, mdxContent, 'utf8');
          console.log(`✅ Successfully published (MDX): ${filePath}`);
          articlesProcessed++;
        } else {
          console.log(`⏩ Article already exists, skipping: ${rewritten.slug}`);
        }

        // Đẩy lên Sanity làm Source of Truth (nếu có SANITY_API_TOKEN + PROJECT_ID)
        try {
          const ok = await pushArticleToSanity({
            slug: rewritten.slug,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: rewritten.content,
            category: feed.category as 'tech' | 'blockchain' | 'game' | 'finance' | 'lifestyle' | 'sports' | 'entertainment' | 'education' | 'science',
            tags: ['AI', 'AutoBlogger', 'News'],
            thumbnail: extractedThumbnail,
            author: 'AI Autobot',
            publishedAt: new Date().toISOString(),
          });
          console.log(ok ? `☁️ Pushed to Sanity: ${rewritten.slug}` : `💾 Sanity chưa cấu hình — giữ MDX local: ${rewritten.slug}`);
        } catch (e) {
          console.error('Sanity push error (giữ MDX):', e);
        }

        // CƠ CHẾ CHỐNG QUÁ TẢI 4: Sleep 3 giây giữa mỗi bài để tản nhiệt CPU và tránh API Rate Limit
        console.log('⏳ Đang nghỉ 3 giây làm mát hệ thống...');
        await sleep(3000);

      } catch (error) {
        console.error(`❌ Failed to process feed ${feed.url}:`, error);
      }
    }
  } finally {
    // Dọn dẹp Lock File dù chạy xong hay bị lỗi
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
      console.log('🔓 Đã xóa Lock file. Giải phóng tiến trình.');
    }
    console.log('🏁 Autoblogger finished.');
  }
}

runAutoblogger();
