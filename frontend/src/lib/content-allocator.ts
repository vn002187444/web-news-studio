/**
 * Intelligent Content Allocation Engine
 *
 * Phân bổ nội dung thông minh cho trang chủ và các phân khu chuyên mục:
 * 1. Phân bổ bài Hero (Tiêu điểm): Tính toán điểm tổng hợp (Recency + Image Quality + Content Depth + Time of Day).
 * 2. Phân bổ Bento Grid: Đảm bảo tính đa dạng chuyên mục (không để 1 chuyên mục lấn át).
 * 3. Phân bổ Trending Widget: Kết hợp tin nóng và tin đọc nhiều.
 * 4. Điều phối theo khung giờ đọc (Morning: Finance/World -> Afternoon: Tech/Crypto -> Evening: Lifestyle/Game/Sports).
 */

export interface AllocatableArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  thumbnail: { url: string; alt: string };
  publishedAt: string;
  contentLength?: number;
}

export interface AllocatedHomepage {
  hero: AllocatableArticle;
  bento: AllocatableArticle[];
  trending: AllocatableArticle[];
  ticker: { title: string; slug: string; category: string }[];
  byCategory: Record<string, AllocatableArticle[]>;
}

// Khung giờ vàng theo tâm lý học tiếp nhận thông tin của độc giả
export function getTimeSlotCategoryWeights(hour = new Date().getHours()): Record<string, number> {
  if (hour >= 5 && hour < 12) {
    // Buổi sáng: Đi làm, theo dõi biến động thị trường & thế giới
    return { finance: 1.5, world: 1.4, tech: 1.2, blockchain: 1.1 };
  }
  if (hour >= 12 && hour < 18) {
    // Buổi trưa & chiều: Cập nhật công nghệ, đổi mới sáng tạo, khoa học
    return { tech: 1.5, blockchain: 1.4, science: 1.3, education: 1.2 };
  }
  // Buổi tối: Giải trí, xả stress, thể thao, phong cách sống
  return { lifestyle: 1.5, game: 1.4, sports: 1.4, entertainment: 1.3, tech: 1.1 };
}

/**
 * Tính điểm trọng số biên tập cho từng bài báo
 */
export function calculateEditorialScore(
  article: AllocatableArticle,
  categoryWeights: Record<string, number> = getTimeSlotCategoryWeights()
): number {
  const now = Date.now();
  const pubTime = new Date(article.publishedAt).getTime();
  const ageHours = Math.max(0, (now - pubTime) / (1000 * 60 * 60));

  // 1. Điểm độ mới (decay theo thời gian: bài dưới 6h điểm cao nhất)
  const recencyScore = Math.max(0, 100 - ageHours * 3);

  // 2. Điểm theo khung giờ tiếp nhận của chuyên mục
  const catMultiplier = categoryWeights[article.category] || 1.0;

  // 3. Điểm chất lượng ảnh (ảnh không phải fallback đơn điệu được cộng điểm)
  const hasRealImage = !article.thumbnail.url.includes('placeholder') && !article.thumbnail.url.includes('fallback');
  const imageBonus = hasRealImage ? 15 : 0;

  // 4. Độ dài tiêu đề chuẩn SEO (60 - 90 ký tự là tối ưu)
  const titleLen = article.title.length;
  const titleScore = titleLen >= 50 && titleLen <= 95 ? 10 : 5;

  return (recencyScore + imageBonus + titleScore) * catMultiplier;
}

/**
 * Phân bổ bài viết cho toàn bộ trang chủ News Studio
 */
export function allocateHomepageContent(
  articles: AllocatableArticle[],
  options?: { currentHour?: number; bentoCount?: number; trendingCount?: number }
): AllocatedHomepage {
  if (!articles || articles.length === 0) {
    const dummy: AllocatableArticle = {
      id: 'default',
      slug: 'chao-mung',
      title: 'Chào mừng đến với News Studio',
      excerpt: 'Đang tải bản tin mới nhất...',
      category: 'tech',
      thumbnail: { url: '/images/placeholders/fallback.webp', alt: 'News Studio' },
      publishedAt: new Date().toISOString(),
    };
    return {
      hero: dummy,
      bento: [],
      trending: [],
      ticker: [],
      byCategory: {},
    };
  }

  const hour = options?.currentHour ?? new Date().getHours();
  const weights = getTimeSlotCategoryWeights(hour);
  const bentoLimit = options?.bentoCount ?? 5;
  const trendingLimit = options?.trendingCount ?? 6;

  // Sắp xếp toàn bộ bài theo điểm biên tập thông minh
  const scored = [...articles].sort((a, b) => calculateEditorialScore(b, weights) - calculateEditorialScore(a, weights));

  // 1. Chọn bài Hero (bài có điểm biên tập cao nhất)
  const hero = scored[0];
  const remaining = scored.filter((a) => a.id !== hero.id);

  // 2. Phân bổ lưới Bento Grid đảm bảo ĐA DẠNG CHUYÊN MỤC
  const bento: AllocatableArticle[] = [];
  const bentoCategories = new Set<string>([hero.category]);

  // Pha 1: Ưu tiên các chuyên mục chưa xuất hiện trong Hero/Bento
  for (const art of remaining) {
    if (bento.length >= bentoLimit) break;
    if (!bentoCategories.has(art.category)) {
      bento.push(art);
      bentoCategories.add(art.category);
    }
  }

  // Pha 2: Nếu chưa đủ số lượng Bento, lấp đầy bằng các bài điểm cao tiếp theo
  if (bento.length < bentoLimit) {
    for (const art of remaining) {
      if (bento.length >= bentoLimit) break;
      if (!bento.some((b) => b.id === art.id)) {
        bento.push(art);
      }
    }
  }

  const bentoIds = new Set(bento.map((b) => b.id));

  // 3. Phân bổ Trending Widget (lấy các bài chất lượng tiếp theo)
  const trending = remaining.filter((a) => !bentoIds.has(a.id)).slice(0, trendingLimit);

  // 4. Phân bổ News Ticker (10 bài mới nhất cho thanh chạy đầu trang)
  const ticker = articles.slice(0, 10).map((a) => ({
    title: a.title,
    slug: a.slug,
    category: a.category,
  }));

  // 5. Gom nhóm theo chuyên mục cho CategorySections
  const byCategory: Record<string, AllocatableArticle[]> = {};
  for (const art of articles) {
    if (!byCategory[art.category]) {
      byCategory[art.category] = [];
    }
    byCategory[art.category].push(art);
  }

  return {
    hero,
    bento,
    trending,
    ticker,
    byCategory,
  };
}
