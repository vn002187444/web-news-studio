'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import AdaptiveImage from '@/components/ui/AdaptiveImage';

export function detectLifestyleTopic(article: { title?: string; excerpt?: string; tags?: string[] }): string {
  const text = `${article.title || ''} ${(article.tags || []).join(' ')} ${article.excerpt || ''}`.toLowerCase();
  
  if (/thời trang|outfit|phong cách|làm đẹp|mặc đẹp|trang phục|capsule wardrobe|vintage/.test(text)) return 'Thời Trang';
  if (/ẩm thực|nấu ăn|món|rán cá|cá hồi|nhà bếp|ăn uống|thực phẩm|mẹo nhà bếp|nội tạng|dinh dưỡng/.test(text)) return 'Ẩm Thực';
  if (/du lịch|du ngoạn|trải nghiệm|khám phá|thuyền buồm|chùa|lễ sene dolta|hoa sữa/.test(text)) return 'Du Lịch';
  if (/không gian sống|nhà dân|chống ngập|decor|nhà ở|hạ tầng|nội thất/.test(text)) return 'Không Gian Sống';
  if (/sức khỏe|y tế|cột sống|ngủ|kiểm tra sức khỏe|bảo vệ sức khỏe|thể dục|lối sống/.test(text)) return 'Sức Khỏe';
  
  return 'Sức Khỏe';
}

export default function LifestyleTemplate({ articles }: { articles: any[] }) {
  const safeArticles = articles && articles.length > 0 ? articles : [];
  const [activeTopic, setActiveTopic] = useState<string>('Tất cả');
  
  const TOPIC_FILTERS = ["Tất cả", "Sức Khỏe", "Du Lịch", "Ẩm Thực", "Không Gian Sống", "Thời Trang"];

  // Đếm số lượng bài viết theo từng topic
  const subCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Tất cả": safeArticles.length };
    TOPIC_FILTERS.slice(1).forEach(topic => {
      counts[topic] = safeArticles.filter(a => detectLifestyleTopic(a) === topic).length;
    });
    return counts;
  }, [safeArticles]);

  // Lọc bài viết theo topic đang chọn
  const filteredArticles = useMemo(() => {
    if (activeTopic === "Tất cả") return safeArticles;
    return safeArticles.filter(a => detectLifestyleTopic(a) === activeTopic);
  }, [safeArticles, activeTopic]);

  return (
    <div className="bg-[#FAF9F6] text-[#1C1917] min-h-screen pt-32 pb-20 selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto px-6 mb-16">
        <span className="font-sans text-xs font-extrabold uppercase tracking-widest text-[#1C1917]/50 block mb-3">
          Contemporary Living & Culture
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tighter uppercase italic leading-[0.9]">
          PHONG CÁCH SỐNG <br /> <span className="font-sans font-bold not-italic">ĐƯƠNG ĐẠI</span>
        </h1>
        
        {/* Topic Filters */}
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-[#1C1917]/10">
          {TOPIC_FILTERS.map((filter, i) => {
            const count = subCategoryCounts[filter] || 0;
            const isActive = activeTopic === filter;
            return (
              <button 
                key={i} 
                onClick={() => setActiveTopic(filter)}
                className={`text-sm font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-all pb-2 flex items-center gap-2 relative ${
                  isActive 
                    ? 'text-[#1C1917]' 
                    : 'text-[#1C1917]/40 hover:text-[#1C1917]'
                }`}
              >
                <span>{filter}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-[#1C1917] text-[#FAF9F6]' : 'bg-[#1C1917]/5 text-[#1C1917]/50'
                }`}>
                  {count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C1917]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-16">
            
            {filteredArticles.length === 0 ? (
               <div className="border border-dashed border-[#1C1917]/20 p-16 text-center rounded-2xl bg-white/40">
                 <div className="w-16 h-16 rounded-full bg-[#1C1917]/5 text-[#1C1917] flex items-center justify-center mx-auto mb-4 text-2xl font-serif">
                   ☕
                 </div>
                 <h3 className="font-serif text-2xl font-light uppercase tracking-tight mb-2">
                   Mục {activeTopic} đang tuyển chọn bài viết
                 </h3>
                 <p className="font-sans text-sm text-[#1C1917]/60 max-w-md mx-auto mb-6">
                   Những góc nhìn tinh tế và trải nghiệm độc đáo về {activeTopic} sẽ sớm được cập nhật. Bạn có thể khám phá các chủ đề khác dưới đây.
                 </p>
                 <button
                   onClick={() => setActiveTopic("Tất cả")}
                   className="px-6 py-2.5 bg-[#1C1917] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest hover:bg-[#1C1917]/80 transition-colors"
                 >
                   Xem tất cả bài viết
                 </button>
               </div>
            ) : (
               <>
                 {/* Cover Story (Featured First Article) */}
                 {filteredArticles[0] && (
                   <Link href={`/lifestyle/${filteredArticles[0].slug}`} className="group block relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-2xl">
                     <AdaptiveImage
                          src={filteredArticles[0].thumbnail}
                          alt={filteredArticles[0].title}
                          category="lifestyle"
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 75vw"
                          className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                     <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                            Tiêu Điểm
                          </span>
                          <span className="font-sans text-[10px] font-bold uppercase tracking-widest bg-[#FAF9F6] text-[#1C1917] px-3 py-1 rounded-full">
                            {detectLifestyleTopic(filteredArticles[0])}
                          </span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light uppercase tracking-tighter leading-tight max-w-4xl group-hover:italic transition-all">
                          {filteredArticles[0].title}
                        </h2>
                        <p className="mt-4 font-sans text-sm md:text-base text-white/70 line-clamp-2 max-w-3xl">
                          {filteredArticles[0].excerpt}
                        </p>
                     </div>
                   </Link>
                 )}

                 {/* Curated Horizontal Showcase (Next 4 articles) */}
                 {filteredArticles.length > 1 && (
                   <div>
                     <h3 className="font-sans text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-4">
                       Tuyển Chọn {activeTopic !== "Tất cả" ? `• ${activeTopic}` : ''} <span className="h-px bg-[#1C1917]/20 flex-1" />
                     </h3>
                     <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x">
                        {filteredArticles.slice(1, 5).map((item, i) => {
                           const topic = detectLifestyleTopic(item);
                           return (
                             <Link key={i} href={`/lifestyle/${item.slug}`} className="w-[75vw] md:w-[40vw] lg:w-[30vw] shrink-0 snap-center group flex flex-col cursor-pointer">
                                <div className="relative aspect-[4/5] w-full overflow-hidden mb-4 bg-black/5 rounded-xl">
                                   <AdaptiveImage
                                        src={item.thumbnail}
                                        alt={item.title || 'Lifestyle Article'}
                                        category="lifestyle"
                                        fill
                                        sizes="(max-width: 768px) 75vw, 30vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                      />
                                   <div className="absolute top-3 left-3">
                                     <span className="font-sans text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-[#1C1917] px-2.5 py-1 rounded-full shadow-sm">
                                       {topic}
                                     </span>
                                   </div>
                                </div>
                                <h3 className="font-serif text-xl md:text-2xl font-bold uppercase leading-tight line-clamp-2 group-hover:text-[#1C1917]/70 transition-colors">
                                  {item.title}
                                </h3>
                                <p className="mt-3 font-sans text-sm text-[#1C1917]/60 line-clamp-2">
                                  {item.excerpt}
                                </p>
                             </Link>
                           );
                        })}
                     </div>
                   </div>
                 )}

                 {/* Magazine Grid (Remaining articles) */}
                 {filteredArticles.length > 5 && (
                   <div>
                      <h3 className="font-sans text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-4">
                       Khám Phá Thêm <span className="h-px bg-[#1C1917]/20 flex-1" />
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {filteredArticles.slice(5).map((item, i) => {
                           const topic = detectLifestyleTopic(item);
                           return (
                             <Link key={i} href={`/lifestyle/${item.slug}`} className="group cursor-pointer border-t border-[#1C1917]/10 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/50">
                                    {topic}
                                  </span>
                                </div>
                                <h3 className="font-serif text-2xl md:text-3xl font-bold uppercase leading-tight mb-3 group-hover:text-[#1C1917]/70 transition-colors">
                                  {item.title}
                                </h3>
                                <div className="relative aspect-video w-full overflow-hidden mb-4 bg-black/5 rounded-xl">
                                   <AdaptiveImage
                                        src={item.thumbnail}
                                        alt={item.title || 'Lifestyle Article'}
                                        category="lifestyle"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 35vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                      />
                                </div>
                                <p className="font-sans text-sm text-[#1C1917]/60 line-clamp-2">
                                  {item.excerpt}
                                </p>
                             </Link>
                           );
                        })}
                     </div>
                   </div>
                 )}
               </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
             <div className="sticky top-32 flex flex-col gap-12">
                
                {/* Quote of the Day */}
                <div className="p-8 border border-[#1C1917] relative bg-white/50">
                   <div className="absolute top-0 left-8 -translate-y-1/2 bg-[#FAF9F6] px-4 font-sans text-xs font-bold uppercase tracking-widest">
                     Góc Cảm Hứng
                   </div>
                   <blockquote className="font-serif text-2xl italic leading-relaxed text-center">
                     "Nghệ thuật sống không nằm ở việc sở hữu thật nhiều, mà ở khả năng cảm nhận sâu sắc vẻ đẹp của những điều giản dị."
                   </blockquote>
                </div>

                {/* Suggestions */}
                <div>
                   <h4 className="font-sans text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b border-[#1C1917]/20">
                     Gợi Ý Trải Nghiệm Tuần Này
                   </h4>
                   <ul className="space-y-4 font-serif text-lg">
                      <li className="text-[#1C1917]/40 font-sans text-sm mt-1">Đang cập nhật gợi ý trải nghiệm mới nhất...</li>
                   </ul>
                </div>

                {/* Newsletter */}
                <div className="bg-[#1C1917] text-[#FAF9F6] p-8 rounded-2xl">
                   <h4 className="font-serif text-3xl mb-4">Bản Tin Cuối Tuần</h4>
                   <p className="font-sans text-sm text-[#FAF9F6]/70 mb-6">
                     Nhận những gợi ý phong cách sống tinh tế nhất được tuyển chọn riêng cho bạn mỗi sáng Chủ Nhật.
                   </p>
                   <div className="flex flex-col gap-3">
                      <input 
                        type="email" 
                        placeholder="Email của bạn..." 
                        className="bg-transparent border-b border-[#FAF9F6]/30 pb-2 outline-none focus:border-[#FAF9F6] transition-colors font-sans text-sm placeholder:text-[#FAF9F6]/30"
                      />
                      <button className="self-start text-xs font-bold uppercase tracking-widest mt-2 hover:text-[#FAF9F6]/70 transition-colors">
                        Đăng Ký →
                      </button>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
