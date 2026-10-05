import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { pushArticleToSanity } from '../src/lib/sanity';
import dotenv from 'dotenv';

// Load biến môi trường từ .env.local và .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || 'MOCK_KEY'; 
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'; 

const parser = new Parser();
const genAI = new GoogleGenerativeAI(API_KEY);

const RSS_FEEDS = [
  // Interleaved để MAX_ARTICLES_PER_RUN luôn phủ đủ 9 chuyên mục
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance' },
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle' },
  { url: 'https://feeds.feedburner.com/ign/games-all', category: 'game' },
  { url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' },
  { url: 'https://cointelegraph.com/rss', category: 'blockchain' },
  // Dự phòng quốc tế (chạy khi feed VN trùng bài)
  { url: 'https://techcrunch.com/feed/', category: 'tech' },
  { url: 'https://www.scmp.com/rss/91/feed', category: 'tech' },
  { url: 'https://japantoday.com/feed/category/tech', category: 'tech' },
  { url: 'https://en.yna.co.kr/RSS/news.xml', category: 'tech' },
];

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 80);
}

function yamlEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

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
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `
      You are an elite Vietnamese Journalist and SEO/GEO/AEO Expert.
      Rewrite the following article to be 100% unique (avoid plagiarism).

      Original Title: ${title}
      Original Content (Snippet/HTML): ${content}

      REQUIREMENTS (bắt buộc đủ cấu trúc gửi Sanity):
      1. MUST output the article in VIETNAMESE language, regardless of the source language.
      2. Create a catchy, click-worthy Title in Vietnamese (≤150 chars).
      3. Generate an SEO-friendly URL slug in English or unaccented Vietnamese (kebab-case).
      4. Write a 1-2 sentence excerpt/meta description in Vietnamese (≤200 chars).
      5. "tags": 3-5 tag ngắn gọn.
      6. "takeaways": 3-5 điểm chính ngắn (AEO).
      7. "faq": 3 cặp {"q","a"} hỏi-đáp trực diện (Google AI Overviews).
      8. Format the "content" in Markdown (.mdx), 800-1500 từ, BẮT BUỘC theo thứ tự:
         - Dòng đầu tiên của content PHẢI là: ## Những điểm chính (Key Takeaways)
           tiếp theo là bullet list copy NGUYÊN VĂN từng phần tử của trường "takeaways".
         - Thân bài ## / ### với 2-3 internal link dạng [text](/${category}/slug-gia-dinh).
         - Mục "## Câu hỏi thường gặp (FAQ)" từ faq.
         - Ghi rõ nguồn gốc tin (VD: Theo VnExpress/SCMP...) ở cuối bài — yêu cầu Attribution & Citation cho GEO.
      9. Do not hallucinate facts. Maintain the original core news.

      Output the result STRICTLY as a JSON object with this schema:
      {
        "title": "String",
        "slug": "String",
        "excerpt": "String",
        "tags": ["String"],
        "takeaways": ["String"],
        "faq": [{"q": "String", "a": "String"}],
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
  const MAX_ARTICLES_PER_RUN = 9; // 1 bài × 9 chuyên mục: tech/finance/sports/lifestyle/game/entertainment/education/science/blockchain

  try {
    for (const feed of RSS_FEEDS) {
      if (articlesProcessed >= MAX_ARTICLES_PER_RUN) {
        console.log(`🛑 Đạt giới hạn an toàn tối đa (${MAX_ARTICLES_PER_RUN} bài/lượt). Tạm dừng để nhường tài nguyên hệ thống.`);
        break;
      }

      console.log(`📡 Fetching RSS: ${feed.url}`);
      try {
        const feedData = await parser.parseURL(feed.url);

        // Duyệt 3 tin mới nhất, lấy tin đầu tiên chưa đăng (tránh mục trắng khi tin top đã có)
        let latestItem: any = null;
        for (const candidate of (feedData.items || []).slice(0, 3)) {
          if (!candidate?.title) continue;
          const candidateSlug = toSlug(candidate.title || '');
          if (fs.existsSync(path.join(POSTS_DIR, `${candidateSlug}.mdx`))) {
            console.log(`⏩ [Cache Check] Đã có bài tương tự, thử tin tiếp theo: ${candidate.title?.slice(0, 60)}`);
            continue;
          }
          latestItem = candidate;
          break;
        }
        if (!latestItem) {
          console.log(`⏩ [Cache Check] Cả 3 tin mới nhất của ${feed.category} đều đã tồn tại, bỏ qua feed.`);
          continue;
        }

        console.log(`📰 Found article: ${latestItem.title}`);
        
        // Bóc tách hình ảnh từ RSS — đa nguồn: enclosure / media:content / media:thumbnail / <img>
        const CATEGORY_FALLBACK: Record<string, string> = {
          tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
          sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
          lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
          game: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1200&q=80',
          entertainment: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
          education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
          science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
          blockchain: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
        };
        let extractedThumbnail = CATEGORY_FALLBACK[feed.category] || CATEGORY_FALLBACK.tech;
        const anyItem = latestItem as any;
        const mediaContent = anyItem['media:content']?.url || anyItem['media:content']?.$?.url;
        const mediaThumb = anyItem['media:thumbnail']?.url || anyItem['media:thumbnail']?.$?.url;
        if (latestItem.enclosure && latestItem.enclosure.url) {
          extractedThumbnail = latestItem.enclosure.url;
        } else if (mediaContent) {
          extractedThumbnail = mediaContent;
        } else if (mediaThumb) {
          extractedThumbnail = mediaThumb;
        } else {
          const htmlSrc = `${latestItem.content || ''} ${latestItem['content:encoded'] || ''} ${latestItem.summary || ''}`;
          const imgMatch = htmlSrc.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
          if (imgMatch && imgMatch[1]) {
            extractedThumbnail = imgMatch[1];
          }
        }

        console.log('✨ Rewriting and Optimizing with Gemini AI (GEO/AEO)...');
        
        const rewritten = await rewriteArticle(latestItem.title!, latestItem.content || latestItem.contentSnippet || '', feed.category);

        if (!rewritten) continue;
        if (!rewritten.title || !rewritten.slug || !rewritten.content) {
          console.error('❌ AI trả thiếu trường bắt buộc (title/slug/content), bỏ qua bài.');
          continue;
        }
        const aiTags = Array.isArray((rewritten as any).tags) && (rewritten as any).tags.length > 0
          ? (rewritten as any).tags.map(String).slice(0, 6)
          : ['AI', 'AutoBlogger', 'News'];

        const mdxContent = `---
title: "${yamlEscape(rewritten.title).slice(0, 200)}"
excerpt: "${yamlEscape(rewritten.excerpt).slice(0, 500)}"
category: "${feed.category}"
publishedAt: "${new Date().toISOString()}"
thumbnail: "${extractedThumbnail}"
tags: ${JSON.stringify(aiTags)}
author: "AI Autobot"
slug: "${toSlug(rewritten.slug || rewritten.title)}"
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
            tags: aiTags,
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
