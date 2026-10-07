import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSanityClient } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const RSS_FEEDS = [
  { name: 'Công Nghệ (Số Hóa)', url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech' },
  { name: 'Kinh Doanh & Tài Chính', url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance' },
  { name: 'Thể Thao', url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports' },
  { name: 'Đời Sống & Phong Cách', url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle' },
  { name: 'Game & Esports (Eurogamer)', url: 'https://www.eurogamer.net/feed/news', category: 'game' },
  { name: 'Giải Trí', url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment' },
  { name: 'Giáo Dục', url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education' },
  { name: 'Khoa Học', url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science' },
  { name: 'Blockchain (CoinTelegraph)', url: 'https://cointelegraph.com/rss', category: 'blockchain' },
];

const ALL_CATEGORIES = ['tech', 'finance', 'sports', 'lifestyle', 'game', 'entertainment', 'education', 'science', 'blockchain'];

const CATEGORY_NAMES: Record<string, string> = {
  tech: 'Công Nghệ',
  finance: 'Tài Chính',
  sports: 'Thể Thao',
  lifestyle: 'Đời Sống',
  game: 'Game',
  entertainment: 'Giải Trí',
  education: 'Giáo Dục',
  science: 'Khoa Học',
  blockchain: 'Blockchain',
};

async function main() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  console.log(`🚀 Đang khởi tạo Báo Cáo Vận Hành & Khám Phá Từ Khóa (${dateStr} ${timeStr})...`);

  // 1. Kiểm tra Môi trường & CMS
  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MOCK_KEY';
  const hasSanityId = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const hasSanityToken = !!process.env.SANITY_API_TOKEN;

  let sanityArticles: any[] = [];
  let sanityTotalViews = 0;
  let sanityStatus = 'Chưa kết nối';

  try {
    const sanity = getSanityClient(false);
    if (sanity) {
      sanityArticles = await sanity.fetch(
        `*[_type == "article"]{ title, category, views, "slug": slug.current, publishedAt } | order(views desc)`
      );
      sanityTotalViews = sanityArticles.reduce((sum, a) => sum + (a.views || 0), 0);
      sanityStatus = `✅ Kết nối thành công (${sanityArticles.length} bài)`;
    }
  } catch (err: any) {
    sanityStatus = `❌ Lỗi: ${err.message}`;
  }

  // 2. Thống kê bài viết Local Manifest
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  let localPosts: any[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      localPosts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {}
  }

  const catCounts: Record<string, { local: number; sanity: number }> = {};
  ALL_CATEGORIES.forEach((cat) => {
    catCounts[cat] = { local: 0, sanity: 0 };
  });

  localPosts.forEach((p) => {
    const cat = p.meta?.category;
    if (cat && catCounts[cat]) catCounts[cat].local += 1;
  });

  sanityArticles.forEach((a) => {
    const cat = a.category;
    if (cat && catCounts[cat]) catCounts[cat].sanity += 1;
  });

  // 3. Kiểm tra 9 nguồn tin RSS
  const parser = new Parser({ timeout: 15000 });
  const feedResults: { name: string; category: string; status: string; count: number; latest: string; latency: number }[] = [];

  for (const feed of RSS_FEEDS) {
    const start = Date.now();
    try {
      const data = await parser.parseURL(feed.url);
      const latency = Date.now() - start;
      const count = data.items?.length || 0;
      const latest = data.items?.[0]?.title || 'Không có tiêu đề';
      feedResults.push({
        name: feed.name,
        category: feed.category,
        status: 'OK',
        count,
        latest,
        latency,
      });
    } catch (err: any) {
      const latency = Date.now() - start;
      feedResults.push({
        name: feed.name,
        category: feed.category,
        status: `LỖI (${err.message})`,
        count: 0,
        latest: 'Không thể kết nối',
        latency,
      });
    }
  }

  // 4. Phân tích các chuyên mục cần bù bài (Starvation Check)
  const hungryCategories = ALL_CATEGORIES.filter((c) => catCounts[c].local < 2);
  const wellStockedCategories = ALL_CATEGORIES.filter((c) => catCounts[c].local >= 3);

  // 5. Gọi Gemini AI để nghiên cứu từ khóa & gợi ý tiêu đề cho ngày hôm nay
  let aiKeywordSection = '';
  if (hasGemini) {
    console.log('✨ Đang gọi Google Gemini AI để phân tích từ khóa và đề xuất bài đăng...');
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite' });

      const prompt = `
Bạn là Giám đốc Nội dung & Chuyên gia SEO/AEO/GEO hàng đầu cho một Tạp chí Tin tức Số Thế hệ Mới (News Studio).
Hôm nay là ngày: ${dateStr}.
Hiện tại hệ thống đang cần bổ sung bài viết khẩn cấp cho các chuyên mục: ${hungryCategories.map((c) => CATEGORY_NAMES[c]).join(', ') || 'Tài chính, Game, Đời sống, Giáo dục'}.

Hãy tạo một bảng nghiên cứu TỪ KHÓA NÓNG & Ý TƯỞNG BÀI VIẾT cho 5 chuyên mục trọng điểm:
1. Tài Chính (Finance)
2. Công Nghệ & AI (Tech)
3. Game & Esports (Game)
4. Đời Sống & Phong Cách Gen Z (Lifestyle)
5. Blockchain & Tiền Số (Blockchain)

Với mỗi chuyên mục, đưa ra 2 từ khóa đắt giá nhất kèm:
- Search Intent (Ý định tìm kiếm)
- Mức độ quan tâm (Search Volume dự đoán)
- Tiêu đề bài viết giật tít chuyên nghiệp, chuẩn AEO (Answer Engine Optimization) & GEO.

Trả về định dạng bảng Markdown chuẩn (Columns: Chuyên Mục | Từ Khóa Mục Tiêu | Intent | Độ Hot | Tiêu Đề Bài Viết Đề Xuất).
Kèm thêm 1 đoạn ngắn "Chiến Lược Điều Phối Khung Giờ Đăng Bài Hôm Nay".
Chỉ trả về nội dung Markdown, không bọc trong \`\`\`markdown code block.
`;

      const aiRes = await model.generateContent(prompt);
      aiKeywordSection = aiRes.response.text().trim();
    } catch (e: any) {
      console.error('Gemini error:', e.message);
      aiKeywordSection = `*(Tạm thời chưa sinh được từ khóa tự động do Gemini API quá tải: ${e.message})*`;
    }
  } else {
    aiKeywordSection = `*(Chưa cấu hình GEMINI_API_KEY - Bỏ qua gợi ý từ khóa tự động)*`;
  }

  // 6. Tạo Báo Cáo Markdown Hoàn Chỉnh
  let md = `# 📊 Báo Cáo Vận Hành, Bảo Trì & Điều Phối Nội Dung News Studio\n\n`;
  md += `> **Thời gian báo cáo**: ${dateStr} lúc ${timeStr} (Giờ Việt Nam)  \n`;
  md += `> **Trạng thái hệ thống**: ${feedResults.every((f) => f.status === 'OK') ? '🟢 **TẤT CẢ DỊCH VỤ HOẠT ĐỘNG TỐT**' : '⚠️ **CÓ CẢNH BÁO NGUỒN CẤP TIN**'}\n\n`;

  md += `## 1. 🛠️ Kiểm Tra Hạ Tầng & Kết Nối\n\n`;
  md += `| Thành phần | Trạng thái | Chi tiết |\n`;
  md += `| :--- | :---: | :--- |\n`;
  md += `| **Sanity CMS** | ${hasSanityId && hasSanityToken ? '🟢' : '🔴'} | ${sanityStatus} |\n`;
  md += `| **Gemini AI Engine** | ${hasGemini ? '🟢' : '🟡'} | Model: \`${process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'}\` |\n`;
  md += `| **Kho dữ liệu Local** | 🟢 | Tổng: **${localPosts.length} bài viết** (trong \`posts-manifest.json\`) |\n`;
  md += `| **Tổng Lượt Xem (Sanity)** | 👁️ | **${sanityTotalViews} views** tích lũy |\n\n`;

  md += `## 2. 📡 Kiểm Tra 9 Nguồn Cấp Tin RSS\n\n`;
  md += `| Chuyên Mục | Nguồn Feed | Trạng Thái | Số Tin | Độ Trễ | Tin Mới Nhất |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;
  feedResults.forEach((f) => {
    const icon = f.status === 'OK' ? '✅' : '❌';
    md += `| **${CATEGORY_NAMES[f.category] || f.category}** | ${f.name} | ${icon} ${f.status} | ${f.count} | ${f.latency}ms | ${f.latest.slice(0, 45)}... |\n`;
  });
  md += `\n`;

  md += `## 3. ⚖️ Phân Bố Nội Dung & Cảnh Báo "Đói Bài" (Content Starvation)\n\n`;
  md += `| Chuyên Mục | Bài Local | Bài Sanity | Đánh Giá Cân Bằng | Trạng Thái Điều Phối |\n`;
  md += `| :--- | :---: | :---: | :---: | :--- |\n`;
  ALL_CATEGORIES.forEach((cat) => {
    const loc = catCounts[cat].local;
    const san = catCounts[cat].sanity;
    let evalText = '🟢 Cân bằng tốt';
    let actionText = 'Đang ổn định';
    if (loc === 0) {
      evalText = '🔴 **TRỐNG (0 BÀI)**';
      actionText = '🚨 **CẦN BÙ BÀI GẤP** để mở giao diện';
    } else if (loc < 3) {
      evalText = '🟡 Thiếu bài (<3 bài)';
      actionText = '⚠️ Ưu tiên nạp thêm tin';
    }
    md += `| **${CATEGORY_NAMES[cat]}** (\`${cat}\`) | ${loc} | ${san} | ${evalText} | ${actionText} |\n`;
  });
  md += `\n`;

  if (sanityArticles.length > 0) {
    md += `## 4. 📈 Top Bài Viết Có Lượt Xem Cao Nhất Trên CMS\n\n`;
    sanityArticles.slice(0, 5).forEach((a, idx) => {
      md += `${idx + 1}. **[${CATEGORY_NAMES[a.category] || a.category}]** ${a.title} — 👁️ **${a.views || 0} lượt xem** (\`/${a.category}/${a.slug}\`)\n`;
    });
    md += `\n`;
  }

  md += `## 5. 🎯 Nghiên Cứu Từ Khóa Thịnh Hành & Gợi Ý Bài Đăng (AI Insights)\n\n`;
  md += `${aiKeywordSection}\n\n`;

  md += `---\n`;
  md += `*Báo cáo được tự động tạo bởi News Studio GitHub Actions Workflow.*  \n`;

  // 7. Ghi ra tệp tin reports/
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportFilePath = path.join(reportsDir, `report-${dateStr}.md`);
  fs.writeFileSync(reportFilePath, md, 'utf8');
  console.log(`✅ Đã lưu báo cáo vào: ${reportFilePath}`);

  // 8. Xuất ra GITHUB_STEP_SUMMARY nếu đang chạy trong GitHub Actions
  const summaryEnv = process.env.GITHUB_STEP_SUMMARY;
  if (summaryEnv) {
    try {
      fs.appendFileSync(summaryEnv, md, 'utf8');
      console.log('✅ Đã ghi báo cáo vào GitHub Step Summary!');
    } catch (e: any) {
      console.warn('Không thể ghi GITHUB_STEP_SUMMARY:', e.message);
    }
  }

  console.log('🏁 Hoàn thành tạo báo cáo vận hành.');
}

main().catch((e) => {
  console.error('Fatal report error:', e);
  process.exit(1);
});
