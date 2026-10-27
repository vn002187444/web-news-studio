'use client';

import { Link } from '@/i18n/routing';
import AdaptiveImage from '@/components/ui/AdaptiveImage';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  thumbnail: { url: string; alt: string };
  tags?: string[];
  publishedAt: string;
}

export default function WorldTemplate({ articles }: { articles: ArticleItem[] }) {
  const worldArticles = articles && articles.length > 0 ? articles : [];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#FBFBFA] text-[#111111] font-sans selection:bg-red-600 selection:text-white">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="border-b-2 border-black pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-red-600 font-semibold">
                Toàn Cầu & Địa Chính Trị
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight uppercase leading-[0.95]">
              Thời Sự <span className="font-light italic">& Thế Giới</span>
            </h1>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600 max-w-md leading-relaxed">
            Dòng chảy tin tức quốc tế, phân tích địa chính trị, bầu cử và biến động toàn cầu được cập nhật liên tục.
          </p>
        </div>

        {worldArticles.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-300 rounded-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
              Đang cập nhật các bản tin Thời sự & Thế giới mới nhất...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cột chính: Lead Article */}
            <div className="lg:col-span-8 space-y-12">
              {worldArticles.slice(0, 1).map((article) => (
                <article key={article.slug} className="group">
                  <Link href={`/world/${article.slug}`} className="block">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-200 rounded-lg mb-6">
                      <AdaptiveImage
                        src={article.thumbnail}
                        alt={article.title}
                        category="world"
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs text-red-600 uppercase mb-3">
                      <span>Tiêu điểm quốc tế</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span className="text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight group-hover:text-red-600 transition-colors mb-4">
                      {article.title}
                    </h2>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </Link>
                </article>
              ))}

              {/* Lưới các bài viết tiếp theo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-200">
                {worldArticles.slice(1, 5).map((article) => (
                  <article key={article.slug} className="group flex flex-col justify-between">
                    <Link href={`/world/${article.slug}`} className="block">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-200 rounded-lg mb-4">
                        <AdaptiveImage
                          src={article.thumbnail}
                          alt={article.title}
                          category="world"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="font-mono text-[11px] text-gray-500 uppercase mb-2">
                        {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                      </div>
                      <h3 className="text-xl font-serif font-bold leading-snug group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            {/* Cột phụ: Sidebar danh sách tin nhanh */}
            <aside className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-8">
              <div className="sticky top-28 space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-6">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">
                    Dòng Sự Kiện
                  </h3>
                  <span className="font-mono text-[10px] text-gray-500 uppercase">
                    {worldArticles.length} Bản tin
                  </span>
                </div>

                <div className="divide-y divide-gray-200">
                  {worldArticles.slice(5).map((article, idx) => (
                    <article key={article.slug} className="py-4 first:pt-0 last:pb-0 group">
                      <Link href={`/world/${article.slug}`} className="block">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500 uppercase mb-1">
                          <span className="text-red-600 font-bold">#{String(idx + 6).padStart(2, '0')}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h4 className="text-base font-serif font-semibold leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
