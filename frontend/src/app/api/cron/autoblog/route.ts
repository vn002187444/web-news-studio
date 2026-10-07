import { NextResponse } from 'next/server';
import { toSlug } from '@/lib/site';
import { markdownToBlocks } from '@/lib/sanity';

// Worker Điều Phối Nội Dung Tự Động Tăng Traffic (Serverless Edge & Cloudflare Worker)
// 1. Tự động cân bằng chuyên mục thiếu bài (Starvation Balancer)
// 2. Điều phối theo Khung Giờ Vàng độc giả online (Time-Slot Targeting)
// 3. Chèn liên kết nội bộ thật để tăng lượt xem xoay vòng (Recirculation Booster)
// 4. Tối ưu hóa trích dẫn AI Overviews (AEO/GEO Engine)
export const dynamic = 'force-dynamic';

const FEEDS = [
  { url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance' },
  { url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { url: 'https://www.eurogamer.net/feed/news', category: 'game' },
  { url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle' },
  { url: 'https://cointelegraph.com/rss', category: 'blockchain' },
  { url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' },
];

function validRewrite(j: any): { title: string; excerpt: string; content: string; tags: string[] } | null {
  if (!j || typeof j !== 'object') return null;
  const title = typeof j.title === 'string' ? j.title.slice(0, 200).trim() : '';
  const excerpt = typeof j.excerpt === 'string' ? j.excerpt.slice(0, 500).trim() : '';
  const content = typeof j.content === 'string' ? j.content.slice(0, 25000).trim() : '';
  if (!title || !content) return null;
  const tags = Array.isArray(j.tags) ? j.tags.map(String).slice(0, 6) : ['AI', 'News'];
  return { title, excerpt, content, tags };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET || 'news_studio_cron_secret_2026';
  const got = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (got !== cronSecret) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const { getSanityClient } = await import('@/lib/sanity');
  const sanity = getSanityClient(true);
  if (!sanity) return NextResponse.json({ ok: false, reason: 'sanity-not-configured' }, { status: 501 });

  // 1. Phân tích Khung Giờ Vàng hiện tại (Múi giờ Việt Nam UTC+7)
  const now = new Date();
  const vnHour = (now.getUTCHours() + 7) % 24;
  let preferredSlot = 'Toàn diện';
  let preferredCategories: string[] = [];

  if (vnHour >= 6 && vnHour < 10) {
    preferredSlot = 'Khung Sáng (Tài Chính & Công Nghệ)';
    preferredCategories = ['finance', 'tech', 'blockchain'];
  } else if (vnHour >= 11 && vnHour < 15) {
    preferredSlot = 'Khung Trưa (Game, Đời Sống & Giải Trí)';
    preferredCategories = ['game', 'lifestyle', 'entertainment'];
  } else {
    preferredSlot = 'Khung Tối (Thể Thao, Blockchain & Khoa Học)';
    preferredCategories = ['sports', 'blockchain', 'science', 'tech'];
  }

  // 2. Phân tích phân bố bài viết trên Sanity CMS để bù đắp các mục đói bài
  let catCount: Record<string, number> = {};
  let recentArticles: { title: string; slug: string; category: string }[] = [];
  try {
    const existing = await sanity.fetch(`*[_type == "article"]{ category }`);
    (existing || []).forEach((a: any) => {
      catCount[a.category] = (catCount[a.category] || 0) + 1;
    });
    recentArticles = await sanity.fetch(
      `*[_type == "article"] | order(publishedAt desc)[0...5]{ title, "slug": slug.current, category }`
    );
  } catch (e) {
    console.warn('Lỗi lấy thống kê Sanity:', e);
  }

  // 3. Thuật toán điều phối động (Dynamic Coordinator Sort):
  // Ưu tiên 1: Chuyên mục có ít bài nhất (< 3 bài) để xóa sổ trang rỗng
  // Ưu tiên 2: Chuyên mục khớp với Khung Giờ Vàng của độc giả
  const sortedFeeds = [...FEEDS].sort((a, b) => {
    const countA = catCount[a.category] || 0;
    const countB = catCount[b.category] || 0;
    if (countA !== countB) return countA - countB;
    const pA = preferredCategories.includes(a.category) ? 1 : 0;
    const pB = preferredCategories.includes(b.category) ? 1 : 0;
    return pB - pA;
  });

  const internalLinksHint = recentArticles.length > 0
    ? recentArticles.map((a) => `- [${a.title}](/${a.category}/${a.slug})`).join('\n')
    : '- [Trang chủ tin tức](/)';

  const Parser = (await import('rss-parser')).default;
  const parser = new Parser({ timeout: 12000 });
  let published = 0;
  const publishedSlugs: string[] = [];

  for (const feed of sortedFeeds) {
    if (published >= 3) break; // Mỗi lượt cron xuất bản tối đa 3 bài trọng điểm để tối ưu quota
    try {
      const data = await parser.parseURL(feed.url);
      let item: any = null;
      let slug = '';

      for (const candidate of ((data.items || []) as any[]).slice(0, 4)) {
        if (!candidate?.title) continue;
        const s = toSlug(candidate.title);
        const exists = await sanity.fetch(`*[_type == "article" && slug.current == $slug][0]._id`, { slug: s });
        if (exists) continue;
        item = candidate;
        slug = s;
        break;
      }
      if (!item) continue;

      const FALLBACK: Record<string, string> = {
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
      let thumbnail = FALLBACK[feed.category] || FALLBACK.tech;
      if (item.enclosure?.url) thumbnail = item.enclosure.url;
      else if (item['media:content']?.url) thumbnail = item['media:content'].url;
      else if (item['media:thumbnail']?.url) thumbnail = item['media:thumbnail'].url;
      else {
        const m = `${item.content || ''} ${item['content:encoded'] || ''}`.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
        if (m?.[1]) thumbnail = m[1];
      }

      let title = item.title.slice(0, 200);
      let excerpt = (item.contentSnippet || '').slice(0, 500);
      let content = `## Tóm tắt\n\n${(item.contentSnippet || item.title).slice(0, 2000)}`;
      let aiTags = ['AI', 'TrendingNews', feed.category];

      if (geminiKey) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const model = new GoogleGenerativeAI(geminiKey).getGenerativeModel({ model: geminiModel });
          
          const prompt = `
Bạn là Giám đốc Biên tập & Chuyên gia AEO/GEO hàng đầu.
Viết lại tin tức sau sang tiếng Việt chuẩn, hấp dẫn, giữ sự thật cốt lõi nhưng giật tít gây tò mò cao (High CTR) để thu hút độc giả.
Chuyên mục: ${feed.category}
Tin gốc: ${item.title} — ${item.contentSnippet || ''}

YÊU CẦU ĐẶC BIỆT ĐỂ TĂNG VIEWER (AEO & RECIRCULATION):
1. Tiêu đề: Cuốn hút, ≤120 ký tự, chứa từ khóa nóng.
2. Dòng đầu tiên của content BẮT BUỘC là: ## Những điểm chính (Key Takeaways) kèm 3-4 gạch đầu dòng tóm tắt thông tin quan trọng nhất (để Google AI Overviews trích dẫn).
3. Thân bài: Chi tiết 800-1200 từ, có H2/H3.
4. TĂNG LƯỢT XEM XOAY VÒNG: Bắt buộc lồng ghép tự nhiên 1-2 liên kết nội bộ sau vào ngữ cảnh bài viết:
${internalLinksHint}
5. Cuối bài: Thêm mục "## Câu hỏi thường gặp (FAQ)" với 3 cặp Q&A trực diện để giành vị trí hiển thị nổi bật trên Google.

Chỉ trả về JSON thuần hợp lệ (không bọc trong markdown):
{
  "title": "String",
  "slug": "String",
  "excerpt": "String",
  "tags": ["String"],
  "content": "String (Markdown format)"
}`;
          const r = await model.generateContent(prompt);
          const parsed = JSON.parse(r.response.text().replace(/```json|```/g, '').trim());
          const v = validRewrite(parsed);
          if (v) {
            title = v.title;
            excerpt = v.excerpt || excerpt;
            content = v.content;
            aiTags = v.tags;
          }
        } catch (aiErr) {
          console.error('Lỗi Gemini AI (dùng fallback):', aiErr);
        }
      }

      const finalSlug = toSlug(title) || slug;
      await sanity.create({
        _type: 'article',
        title,
        excerpt,
        content,
        body: markdownToBlocks(content),
        slug: { _type: 'slug', current: finalSlug },
        category: feed.category,
        categoryRef: { _type: 'reference', _ref: `category-${feed.category}` },
        tags: aiTags,
        thumbnail,
        author: 'News Coordinator AI',
        authorRef: { _type: 'reference', _ref: `author-${feed.category}` },
        publishedAt: new Date().toISOString(),
        views: 0,
      });

      published += 1;
      publishedSlugs.push(finalSlug);
    } catch (feedErr) {
      console.warn(`Lỗi xử lý feed ${feed.url}:`, feedErr);
    }
  }

  return NextResponse.json({
    ok: true,
    published,
    publishedSlugs,
    coordinator: {
      vietnamHour: vnHour,
      preferredSlot,
      preferredCategories,
    },
  });
}
