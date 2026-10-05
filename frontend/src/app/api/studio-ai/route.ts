import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { markdownToBlocks } from '@/lib/sanity';

// Dùng bởi Studio tool "AI Viết bài": POST {input, category} → bài nháp đầy đủ cấu trúc.
// Bảo vệ quota Gemini: yêu cầu bật Draft Mode trước (/api/draft?secret=...).
export async function POST(request: Request) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) {
    return NextResponse.json({ ok: false, reason: 'Bật Draft Mode trước: /api/draft?secret=YOUR_SECRET' }, { status: 401 });
  }
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return NextResponse.json({ ok: false, reason: 'GEMINI_API_KEY chưa cấu hình' }, { status: 501 });

  let input = '';
  let category = 'tech';
  try {
    const body = await request.json();
    input = String(body?.input || '').slice(0, 4000);
    category = String(body?.category || 'tech').slice(0, 30);
  } catch { /* ignore */ }
  if (!input.trim()) return NextResponse.json({ ok: false, reason: 'Thiếu input (link tin hoặc ý chính)' }, { status: 400 });

  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
    });
    const r = await model.generateContent(`
You are an elite Vietnamese Tech Journalist + SEO/GEO/AEO expert.
Dựa vào gợi ý/link sau, viết 1 bài báo TIẾNG VIỆT hoàn chỉnh, unique, không bịa fact cốt lõi.

Gợi ý: ${input}
Chuyên mục: ${category}

YÊU CẦU CẤU TRÚC (bắt buộc đủ):
1. "title": tiêu đề tiếng Việt giật tít, ≤150 ký tự.
2. "slug": kebab-case không dấu, tiếng Anh hoặc Việt không dấu.
3. "excerpt": 1-2 câu meta description tiếng Việt, ≤200 ký tự.
4. "tags": mảng 3-5 tag tiếng Việt/Anh ngắn gọn.
5. "takeaways": mảng 3-5 điểm chính ngắn (AEO).
6. "faq": mảng 3 cặp {"q","a"} hỏi-đáp trực diện (AI Overviews).
7. "content": Markdown đầy đủ gồm: dòng đầu tiên BẮT BUỘC là "## Những điểm chính (Key Takeaways)" rồi bullet copy NGUYÊN VĂN từng takeaways, các mục ## / ### thân bài (mỗi mục 2-4 đoạn, có 2-3 internal link dạng [text](/${category}/slug-gia-dinh)), mục "## Câu hỏi thường gặp (FAQ)" từ faq, kết bài ngắn + ghi nguồn tin.
Độ dài content 800-1500 từ.

Chỉ trả JSON thuần (không markdown fence) theo schema:
{"title":"...","slug":"...","excerpt":"...","tags":[...],"takeaways":[...],"faq":[{"q":"...","a":"..."}],"content":"..."}`);
    const parsed = JSON.parse(r.response.text().replace(/```json|```/g, '').trim());
    if (!parsed.title || !parsed.content || !parsed.slug) {
      return NextResponse.json({ ok: false, reason: 'AI trả thiếu trường bắt buộc' }, { status: 502 });
    }
    const body = markdownToBlocks(String(parsed.content));
    return NextResponse.json({
      ok: true,
      article: {
        title: String(parsed.title).slice(0, 200),
        slug: String(parsed.slug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 80),
        excerpt: String(parsed.excerpt || '').slice(0, 500),
        content: String(parsed.content).slice(0, 20000),
        body,
        tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 6) : [],
        takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways.map(String).slice(0, 6) : [],
        faq: Array.isArray(parsed.faq) ? parsed.faq.slice(0, 5) : [],
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: `Gemini lỗi: ${String(e).slice(0, 200)}` }, { status: 502 });
  }
}
