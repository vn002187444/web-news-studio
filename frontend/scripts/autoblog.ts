import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { pushArticleToSanity, getSanityClient } from '../src/lib/sanity';
import dotenv from 'dotenv';

// Load biến môi trường từ .env.local và .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || 'MOCK_KEY'; 
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'; 

const parser = new Parser();
const genAI = new GoogleGenerativeAI(API_KEY);

// Kiểm tra tương đồng từ ngữ giữa 2 tiêu đề (chống bài trùng lặp tuyệt đối)
// threshold mặc định 0.50 cho so sánh chéo ngôn ngữ (tiêu đề gốc RSS vs tiêu đề đã viết lại);
// check cùng-vụ-việc sau khi AI viết lại dùng isSameStory (ngưỡng hiệu chỉnh từ dữ liệu thật).
function titleWordSet(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function isSimilarTitle(t1: string, t2: string, threshold = 0.50): boolean {
  if (!t1 || !t2) return false;
  const clean1 = t1.toLowerCase().trim();
  const clean2 = t2.toLowerCase().trim();
  if (clean1 === clean2) return true;

  const w1 = titleWordSet(t1);
  const w2 = titleWordSet(t2);
  if (w1.size === 0 || w2.size === 0) return false;

  let matches = 0;
  w1.forEach((w) => {
    if (w2.has(w)) matches++;
  });
  const similarity = matches / Math.min(w1.size, w2.size);
  return similarity >= threshold;
}

// Cùng 1 vụ việc? (cùng chuyên mục, sau khi AI viết lại)
// Điều kiện: tương đồng >= 0.30 VÀ >= 4 từ chung — hiệu chỉnh trên 127 bài thật:
// bắt được các cặp Skate / Starlink / Brazil / Quang Thắng / ASEAN Cup,
// chỉ sót các bài follow-up đổi hẳn góc nhìn (sẽ bắt bằng check thumbnail).
function isSameStory(titleA: string, titleB: string): boolean {
  const wA = titleWordSet(titleA);
  const wB = titleWordSet(titleB);
  if (wA.size === 0 || wB.size === 0) return false;
  let overlap = 0;
  wA.forEach((w) => {
    if (wB.has(w)) overlap++;
  });
  const similarity = overlap / Math.min(wA.size, wB.size);
  return similarity >= 0.30 && overlap >= 4;
}

// Thumbnail fallback theo chuyên mục (ảnh dùng chung) — KHÔNG dùng để fingerprint trùng bài.
const FALLBACK_THUMB_IDS = [
  'photo-1518770660439-4636190af475', // tech
  'photo-1611974789855-9c2a0a7236a3', // finance
  'photo-1461896836934-ffe607ba8211', // sports
  'photo-1506126613408-eca07ce68773', // lifestyle
  'photo-1552820728-8b83bb6b773f', // game
  'photo-1598899134739-24c46f58b8c0', // entertainment
  'photo-1523050854058-8df90110c9f1', // education
  'photo-1532094349884-543bc11b234d', // science
  'photo-1639762681485-074b7f938ba0', // blockchain
];

function isFingerprintableThumb(url: string): boolean {
  if (!url) return false;
  return !FALLBACK_THUMB_IDS.some((id) => url.includes(id));
}

const RSS_FEEDS = [
  // Interleaved để MAX_ARTICLES_PER_RUN luôn phủ đủ 9 chuyên mục
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance' },
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle' },
  { url: 'https://www.eurogamer.net/feed/news', category: 'game' },
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
      2. Create a catchy, click-worthy Title in Vietnamese (60-75 chars for SEO).
      3. Generate an SEO-friendly URL slug in English or unaccented Vietnamese (kebab-case).
      4. Write a 1-2 sentence excerpt/meta description in Vietnamese (≤200 chars).
      5. "tags": 3-5 tag ngắn gọn.
      6. "takeaways": 3-5 điểm chính ngắn (AEO).
      7. "faq": 3 cặp {"q","a"} hỏi-đáp trực diện (Google AI Overviews).
      8. Format the "content" in Markdown (.mdx), 800-1500 từ, BẮT BUỘC theo thứ tự:
         - Dòng đầu tiên của content PHẢI là: ## Những điểm chính (Key Takeaways)
           tiếp theo là bullet list copy NGUYÊN VĂN từng phần tử của trường "takeaways".
          - Thân bài ## / ### với 2-3 internal link BẮT BUỘC có tiền tố locale /vi/ dạng [text](/vi/${category}/slug-gia-dinh). KHÔNG viết link thiếu /vi/.
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

    let retries = 5;
    let delay = 3000;
    while (retries >= 0) {
      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err: any) {
        if (retries > 0 && (err?.status === 503 || err?.status === 429)) {
          console.warn(`⏳ Gemini API đang quá tải (${err.status}), đang thử lại sau ${delay/1000} giây... (còn ${retries} lần)`);
          await sleep(delay);
          delay *= 2;
          retries--;
        } else {
          console.error('Error generating content with Gemini:', err);
          break; // Thoát vòng lặp để xử lý fallback
        }
      }
    }

    // Fallback logic when API repeatedly fails
    console.warn(`⚠️ Gemini API thất bại liên tục, sử dụng nội dung fallback cho bài viết: ${title}`);

    return createFallbackArticle(title, content);
  } catch (error) {
    console.error('Error in rewriteArticle:', error);
    return createFallbackArticle(title, content);
  }
}

function createFallbackArticle(title: string, content: string) {
  const fallbackSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const fallbackExcerpt = typeof content === 'string' ? content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'Nội dung đang được cập nhật...';

  return {
    title: `[Auto-Generated] ${title}`,
    slug: fallbackSlug,
    excerpt: fallbackExcerpt,
    tags: ['Auto-Generated', 'News'],
    takeaways: ['Nội dung gốc chưa qua xử lý AI.'],
    faq: [],
    content: `> **Cảnh báo:** Bài viết này được tạo tự động mà không qua quá trình xử lý của AI do hệ thống API đang quá tải.\n\n${content}`
  };
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
  const MAX_ARTICLES_PER_RUN = 20;

  // 1. Phân tích Khung Giờ Vàng hiện tại (Giờ VN UTC+7)
  const now = new Date();
  const vnHour = (now.getUTCHours() + 7) % 24;
  let preferredCategories: string[] = [];
  if (vnHour >= 6 && vnHour < 10) {
    preferredCategories = ['finance', 'tech', 'blockchain'];
  } else if (vnHour >= 11 && vnHour < 15) {
    preferredCategories = ['game', 'lifestyle', 'entertainment'];
  } else {
    preferredCategories = ['sports', 'blockchain', 'science', 'tech'];
  }

  // 2. Phân tích độ đói bài từ posts-manifest.json
  const catCount: Record<string, number> = {};
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const posts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      posts.forEach((p: any) => {
        const cat = p.meta?.category;
        if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
      });
    } catch {}
  }

  // 3. Thu thập dữ liệu các bài đã đăng để CHỐNG TRÙNG LẶP TUYỆT ĐỐI (từ Manifest + Sanity + MDX)
  const publishedTitles: string[] = [];
  const publishedSlugs = new Set<string>();
  // Tiêu đề + thumbnail theo từng chuyên mục → check cùng-vụ-việc sau khi AI viết lại (ngưỡng 0.35)
  const publishedTitlesByCat: Record<string, string[]> = {};
  const publishedThumbs = new Set<string>();
  const trackPublished = (cat: string, title: string, thumb?: string) => {
    const c = (cat || '').toLowerCase();
    if (title) {
      publishedTitles.push(title);
      if (c) {
        if (!publishedTitlesByCat[c]) publishedTitlesByCat[c] = [];
        publishedTitlesByCat[c].push(title);
      }
    }
    if (thumb && isFingerprintableThumb(thumb)) publishedThumbs.add(thumb);
  };

  if (fs.existsSync(manifestPath)) {
    try {
      const posts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      posts.forEach((p: any) => {
        if (p.slug) publishedSlugs.add(p.slug);
        if (p.meta?.slug) publishedSlugs.add(p.meta.slug);
        trackPublished(p.meta?.category, p.meta?.title, p.meta?.thumbnail);
      });
    } catch {}
  }

  // Quét thêm Sanity CMS
  try {
    const sanity = getSanityClient(false);
    if (sanity) {
      const sanityArticles: any[] = await sanity.fetch(`*[_type == "article"] { "slug": slug.current, title, category, thumbnail }`);
      sanityArticles.forEach((a) => {
        if (a.slug) publishedSlugs.add(a.slug);
        trackPublished(a.category, a.title, a.thumbnail);
      });
    }
  } catch {}

  // Quét thêm thư mục local posts
  if (fs.existsSync(POSTS_DIR)) {
    try {
      const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'));
      files.forEach(f => publishedSlugs.add(f.replace(/\.mdx$/, '')));
    } catch {}
  }

  console.log(`📚 Đã nạp ${publishedSlugs.size} slugs & ${publishedTitles.length} tiêu đề & ${publishedThumbs.size} thumbnails đã xuất bản để đối chiếu chống trùng.`);

  // 4. Điều phối thông minh: Ưu tiên mục thiếu bài (< 3 bài) -> Khung giờ vàng
  const sortedFeeds = [...RSS_FEEDS].sort((a, b) => {
    const countA = catCount[a.category] || 0;
    const countB = catCount[b.category] || 0;
    if (countA !== countB) return countA - countB;
    const pA = preferredCategories.includes(a.category) ? 1 : 0;
    const pB = preferredCategories.includes(b.category) ? 1 : 0;
    return pB - pA;
  });

  // CÂN BẰNG CHUYÊN MỤC: tối đa 2 bài/mục/lượt (tech có 5 feeds nên trước đây lấn át),
  // chạy 2 pha — pha 1 chỉ các mục dưới trung bình, pha 2 lấp chỗ còn lại.
  const MAX_PER_CAT_PER_RUN = 2;
  const perCatPublished: Record<string, number> = {};
  const totalKnown = Object.values(catCount).reduce((s, n) => s + n, 0);
  const avgCount = totalKnown > 0 ? totalKnown / 9 : 0;
  const phase1 = sortedFeeds.filter((f) => (catCount[f.category] || 0) < avgCount);
  const phase2 = sortedFeeds.filter((f) => (catCount[f.category] || 0) >= avgCount);
  const orderedFeeds = [...phase1, ...phase2];
  console.log(`⚖️ Cân bằng: trung bình ${avgCount.toFixed(1)} bài/mục, pha 1 có ${phase1.length} feeds (mục đói), cap ${MAX_PER_CAT_PER_RUN} bài/mục/lượt.`);

  try {
    for (const feed of orderedFeeds) {
      if (articlesProcessed >= MAX_ARTICLES_PER_RUN) {
        console.log(`🛑 Đạt giới hạn an toàn tối đa (${MAX_ARTICLES_PER_RUN} bài/lượt). Tạm dừng để nhường tài nguyên hệ thống.`);
        break;
      }
      if ((perCatPublished[feed.category] || 0) >= MAX_PER_CAT_PER_RUN) {
        console.log(`⏩ [Cân bằng] Mục ${feed.category} đã đủ ${MAX_PER_CAT_PER_RUN} bài lượt này, nhường cho mục khác.`);
        continue;
      }

      console.log(`📡 Fetching RSS: ${feed.url}`);
      try {
        const feedData = await parser.parseURL(feed.url);

        // Duyệt 5 tin mới nhất, lấy tin đầu tiên chưa đăng (kiểm tra chống trùng theo cả slug và nội dung tiêu đề)
        let latestItem: any = null;
        for (const candidate of (feedData.items || []).slice(0, 5)) {
          if (!candidate?.title) continue;
          const candidateTitle = candidate.title.trim();
          const candidateSlug = toSlug(candidateTitle);

          // 1. Kiểm tra slug đã tồn tại
          if (publishedSlugs.has(candidateSlug)) {
            console.log(`⏩ [Chống trùng] Đã có slug tương tự: ${candidateSlug}`);
            continue;
          }

          // 2. Kiểm tra tương đồng tiêu đề (>= 50% từ ngữ) với mọi bài đã xuất bản
          const isDup = publishedTitles.some((t) => isSimilarTitle(t, candidateTitle));
          if (isDup) {
            console.log(`⏩ [Chống trùng] Đã có bài nội dung tương tự: "${candidateTitle.slice(0, 60)}"`);
            continue;
          }

          latestItem = candidate;
          break;
        }
        if (!latestItem) {
          console.log(`⏩ [Chống trùng] Tất cả tin mới nhất của ${feed.category} đều đã được xuất bản trước đó, bỏ qua feed.`);
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

        const finalSlug = toSlug(rewritten.slug || rewritten.title);
        // Kiểm tra kép sau khi AI sinh: slug / tiêu đề toàn cục (0.50) +
        // cùng chuyên mục (0.35 + thực thể chính) + cùng ảnh thật (không tính ảnh fallback dùng chung).
        const catTitles = publishedTitlesByCat[feed.category] || [];
        const dupSameCat = catTitles.some((t) => isSameStory(t, rewritten.title));
        const dupGlobal = publishedTitles.some((t) => isSimilarTitle(t, rewritten.title));
        const dupThumb = isFingerprintableThumb(extractedThumbnail) && publishedThumbs.has(extractedThumbnail);
        if (publishedSlugs.has(finalSlug) || dupSameCat || dupGlobal || dupThumb) {
          console.log(`⏩ [AI Dup Check] Bài AI sinh ra trùng với nội dung đã có (${finalSlug}), bỏ qua.`);
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
slug: "${finalSlug}"
---

${rewritten.content}
`;

        const filePath = path.join(POSTS_DIR, `${finalSlug}.mdx`);
        
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, mdxContent, 'utf8');
          console.log(`✅ Successfully published (MDX): ${filePath}`);
          articlesProcessed++;
          perCatPublished[feed.category] = (perCatPublished[feed.category] || 0) + 1;
        } else {
          console.log(`⏩ Article already exists, skipping: ${finalSlug}`);
        }

        // Đánh dấu vào bộ nhớ để các feed phía sau không bao giờ trùng bài này
        publishedSlugs.add(finalSlug);
        publishedSlugs.add(toSlug(latestItem.title));
        publishedTitles.push(rewritten.title);
        publishedTitles.push(latestItem.title);
        trackPublished(feed.category, rewritten.title, extractedThumbnail);

        // Đẩy lên Sanity làm Source of Truth (nếu có SANITY_API_TOKEN + PROJECT_ID)
        try {
          const ok = await pushArticleToSanity({
            slug: finalSlug,
            title: rewritten.title,
            excerpt: rewritten.excerpt,
            content: rewritten.content,
            category: feed.category as 'tech' | 'blockchain' | 'game' | 'finance' | 'lifestyle' | 'sports' | 'entertainment' | 'education' | 'science',
            tags: aiTags,
            thumbnail: extractedThumbnail,
            author: 'AI Autobot',
            publishedAt: new Date().toISOString(),
          });
          console.log(ok ? `☁️ Pushed to Sanity: ${finalSlug}` : `💾 Sanity chưa cấu hình — giữ MDX local: ${finalSlug}`);
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

runAutoblogger()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Autoblog fatal crash:', err);
    process.exit(1);
  });
