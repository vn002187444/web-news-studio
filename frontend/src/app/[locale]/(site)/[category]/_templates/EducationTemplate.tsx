'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export function detectEduSubCategory(article: { title?: string; excerpt?: string; tags?: string[] }): string {
  const text = `${article.title || ''} ${(article.tags || []).join(' ')} ${article.excerpt || ''}`.toLowerCase();
  
  if (/học bổng|scholarship|tài trợ|erasmus/.test(text)) return 'Học bổng';
  if (/du học|du học sinh|quốc tế|new zealand|châu âu/.test(text)) return 'Du học';
  if (/việc làm|tuyển dụng|nghề nghiệp|ứng viên|soát vé|doanh nghiệp|lao động/.test(text)) return 'Việc làm';
  if (/kỹ năng|thực chiến|ai trong giáo dục|chuyển đổi số|kỹ năng số|đào tạo|laptop|giáo dục số/.test(text)) return 'Kỹ năng';
  
  return 'Kỹ năng';
}

export default function EducationTemplate({ articles }: { articles: any[] }) {
  const eduArticles = articles && articles.length > 0 ? articles : [];
  const [activeTag, setActiveTag] = useState<string>('Tất cả');

  const EDU_TAGS = ['Tất cả', 'Học bổng', 'Việc làm', 'Du học', 'Kỹ năng'];

  // Đếm số lượng bài cho từng chuyên mục con
  const subCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Tất cả': eduArticles.length };
    EDU_TAGS.slice(1).forEach(tag => {
      counts[tag] = eduArticles.filter(a => detectEduSubCategory(a) === tag).length;
    });
    return counts;
  }, [eduArticles]);

  // Lọc bài viết theo tag đang chọn
  const filteredArticles = useMemo(() => {
    if (activeTag === 'Tất cả') return eduArticles;
    return eduArticles.filter(a => detectEduSubCategory(a) === activeTag);
  }, [eduArticles, activeTag]);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#faf9f6] text-[#1c355e] font-sans selection:bg-[#0047AB] selection:text-white">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0047AB] block mb-2">
            Youth & Knowledge Hub
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-[#1c355e] tracking-tight mb-4">
            Campus <span className="italic text-[#0047AB]">Editorial</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Hành trình học vấn, định hướng nghề nghiệp và cơ hội học bổng dành cho Gen Z.
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex justify-center gap-3 mb-16 flex-wrap">
          {EDU_TAGS.map(tag => {
            const count = subCategoryCounts[tag] || 0;
            const isActive = activeTag === tag;
            return (
              <button 
                key={tag} 
                onClick={() => setActiveTag(tag)}
                className={`px-5 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0047AB] text-white border-[#0047AB] shadow-md shadow-[#0047AB]/20 scale-105'
                    : 'bg-white text-[#1c355e]/70 border-[#1c355e]/20 hover:border-[#0047AB] hover:text-[#0047AB]'
                }`}
              >
                <span>{tag}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline Layout */}
        {filteredArticles.length > 0 ? (
          <div className="relative border-l border-[#1c355e]/10 pl-8 ml-4 md:ml-0 md:border-none md:pl-0">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#1c355e]/10 -translate-x-1/2" />
            
            <div className="space-y-16">
              {filteredArticles.map((article, i) => {
                const subCat = detectEduSubCategory(article);
                return (
                  <div key={i} className={`relative md:flex items-center justify-between gap-16 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    {/* Timeline Dot */}
                    <div className="absolute left-[-37px] md:left-1/2 top-0 md:top-1/2 w-4 h-4 rounded-full bg-[#0047AB] border-4 border-[#faf9f6] md:-translate-x-1/2 md:-translate-y-1/2 z-10" />
                    
                    <div className="md:w-1/2" />
                    
                    <Link href={`/education/${article.slug}`} className="md:w-1/2 group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-[#1c355e]/5 overflow-hidden">
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        {article.thumbnail?.url ? (
                          <Image
                            src={article.thumbnail.url}
                            alt={article.thumbnail.alt || article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-[#0047AB]/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                            {subCat}
                          </span>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-[#0047AB] uppercase tracking-wider bg-[#0047AB]/10 px-3 py-1 rounded-full">
                            {subCat}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-[#0047AB] transition-colors leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0047AB] uppercase tracking-wider">
                          <span>Đọc chi tiết</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[#1c355e]/20 bg-white rounded-2xl p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#0047AB]/10 text-[#0047AB] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              📚
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c355e] mb-2">
              Chưa có bài viết cho mục {activeTag}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Các cơ hội học bổng, việc làm và tài liệu mới đang được cập nhật liên tục. Vui lòng quay lại sau ít phút hoặc xem toàn bộ tin tức.
            </p>
            <button
              onClick={() => setActiveTag('Tất cả')}
              className="px-6 py-2.5 rounded-full bg-[#0047AB] text-white font-medium text-xs hover:bg-[#1c355e] transition-colors"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
