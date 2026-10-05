import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site';
import { getAllPostsUnified } from '@/lib/posts';

export async function GET() {
  const posts = await getAllPostsUnified();
  const recentPosts = posts.slice(0, 15);

  const text = `# News Studio
> Trang tin tức công nghệ, tài chính, blockchain, khoa học và đời sống đa phương tiện thế hệ mới, tối ưu hóa cho tương tác đa ngôn ngữ và phân tích dữ liệu chuyên sâu.

## Chuyên mục chính
- Công nghệ (Tech): ${SITE_URL}/vi/tech
- Blockchain & Tiền mã hóa: ${SITE_URL}/vi/blockchain
- Tài chính (Finance): ${SITE_URL}/vi/finance
- Game: ${SITE_URL}/vi/game
- Khoa học (Science): ${SITE_URL}/vi/science
- Đời sống (Lifestyle): ${SITE_URL}/vi/lifestyle
- Thể thao (Sports): ${SITE_URL}/vi/sports
- Giải trí (Entertainment): ${SITE_URL}/vi/entertainment
- Giáo dục (Education): ${SITE_URL}/vi/education

## Bài viết nổi bật mới nhất
${recentPosts.map((p) => `- [${p.meta.title}](${SITE_URL}/vi/${p.meta.category}/${p.slug}): ${p.meta.excerpt}`).join('\n')}

## Cấu trúc dữ liệu & Bản quyền
- Nội dung được biên tập và tóm tắt theo chuẩn GEO / AEO với điểm tin chính (Key Takeaways) và hỏi đáp trực tiếp.
- API Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
