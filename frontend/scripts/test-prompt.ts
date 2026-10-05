import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const input = 'Apple ra mắt kính AR thế hệ mới với chip M5, giá từ 999 USD';
const category = 'tech';

async function main() {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '').getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
  });
  const r = await model.generateContent(`
You are an elite Vietnamese Tech Journalist + SEO/GEO/AEO expert.
Dựa vào gợi ý/link sau, viết 1 bài báo TIẾNG VIỆT hoàn chỉnh, unique, không bịa fact cốt lõi.
Gợi ý: ${input}
Chuyên mục: ${category}
YÊU CẦU CẤU TRÚC (bắt buộc đủ):
1. "title" ≤150 ký tự. 2. "slug" kebab-case. 3. "excerpt" ≤200 ký tự.
4. "tags" 3-5 tag. 5. "takeaways" 3-5 điểm. 6. "faq" 3 cặp {"q","a"}.
7. "content" Markdown 800-1500 từ: DÒNG ĐẦU TIÊN BẮT BUỘC là "## Những điểm chính (Key Takeaways)" rồi bullet copy NGUYÊN VĂN từng takeaways, thân bài ## / ### có internal link [text](/${category}/slug), ## Câu hỏi thường gặp, cuối bài ghi nguồn.
Chỉ trả JSON thuần: {"title","slug","excerpt","tags","takeaways","faq","content"}`);
  const parsed = JSON.parse(r.response.text().replace(/```json|```/g, '').trim());
  fs.writeFileSync('prompt-test-output.json', JSON.stringify(parsed, null, 2), 'utf8');
  const content: string = parsed.content || '';
  const checks = {
    title: typeof parsed.title === 'string' && parsed.title.length > 0,
    slug: typeof parsed.slug === 'string' && /^[a-z0-9-]+$/.test(parsed.slug),
    excerpt: typeof parsed.excerpt === 'string' && parsed.excerpt.length > 0,
    tags: Array.isArray(parsed.tags) && parsed.tags.length >= 3,
    takeaways: Array.isArray(parsed.takeaways) && parsed.takeaways.length >= 3,
    faq: Array.isArray(parsed.faq) && parsed.faq.length >= 3 && parsed.faq.every((f: any) => f.q && f.a),
    hasH2: /^## /m.test(content),
    hasTakeaways: /takeaways|điểm chính|tóm tắt/i.test(content),
    hasFaq: /faq|câu hỏi/i.test(content),
    hasInternalLink: /\(\/[a-z-]+\/[a-z0-9-]+\)/.test(content),
    hasSource: /nguồn|theo .*vn|vnExpress|SCMP/i.test(content),
  };
  console.log(JSON.stringify({ ...checks, contentLen: content.length, title: parsed.title?.slice(0, 80) }, null, 2));
  const fail = Object.entries(checks).filter(([, v]) => v === false).map(([k]) => k);
  if (fail.length > 0) { console.error('FAIL:', fail.join(',')); process.exit(1); }
  console.log('PROMPT TEST: PASS');
}
main().catch((e) => { console.error('ERROR:', String(e).slice(0, 300)); process.exit(1); });
