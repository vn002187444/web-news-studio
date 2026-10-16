'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function LifestyleTemplate({ articles }: { articles: any[] }) {
  const safeArticles = articles && articles.length > 0 ? articles : [];
  
  const TOPIC_FILTERS = ["Sức Khỏe", "Du Lịch", "Ẩm Thực", "Không Gian Sống", "Thời Trang"];

  return (
    <div className="bg-[#FAF9F6] text-[#1C1917] min-h-screen pt-32 pb-20">
      <div className="max-w-[1600px] mx-auto px-6 mb-16">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tighter uppercase italic leading-[0.9]">
          PHONG CÁCH SỐNG <br /> <span className="font-sans font-bold not-italic">ĐƯƠNG ĐẠI</span>
        </h1>
        
        {/* Topic Filters */}
        <div className="mt-12 flex gap-6 overflow-x-auto pb-4 scrollbar-hide border-b border-[#1C1917]/10">
          {TOPIC_FILTERS.map((filter, i) => (
            <button key={i} className="text-sm font-sans font-bold uppercase tracking-wider text-[#1C1917]/50 hover:text-[#1C1917] whitespace-nowrap transition-colors pb-2">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-16">
            
            {safeArticles.length === 0 ? (
               <p className="font-mono text-xs uppercase tracking-widest text-gray-500 border border-dashed p-8 text-center">Chưa có bài Đời Sống — hệ thống sẽ tự động cập nhật bài viết mới.</p>
            ) : (
               <>
                 {/* Cover Story (Featured First Article) */}
                 {safeArticles[0] && (
                   <Link href={`/lifestyle/${safeArticles[0].slug}`} className="group block relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
                     {safeArticles[0].thumbnail?.url && (
                       <Image
                         src={safeArticles[0].thumbnail.url}
                         alt={safeArticles[0].thumbnail.alt || safeArticles[0].title}
                         fill
                         sizes="(max-width: 1024px) 100vw, 75vw"
                         className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                       />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                     <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                        <div className="font-sans text-xs font-bold uppercase tracking-widest mb-4 opacity-80">
                          Tiêu Điểm
                        </div>
                        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light uppercase tracking-tighter leading-tight max-w-4xl group-hover:italic transition-all">
                          {safeArticles[0].title}
                        </h2>
                     </div>
                   </Link>
                 )}

                 {/* Curated Horizontal Showcase (Next 4 articles) */}
                 {safeArticles.length > 1 && (
                   <div>
                     <h3 className="font-sans text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-4">
                       Gợi Ý Cho Bạn <span className="h-px bg-[#1C1917]/20 flex-1" />
                     </h3>
                     <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x">
                        {safeArticles.slice(1, 5).map((item, i) => (
                           <Link key={i} href={`/lifestyle/${item.slug}`} className="w-[75vw] md:w-[40vw] lg:w-[30vw] shrink-0 snap-center group flex flex-col cursor-pointer">
                              <div className="relative aspect-[4/5] w-full overflow-hidden mb-4 bg-black/5">
                                 {item.thumbnail?.url && (
                                   <Image
                                     src={item.thumbnail.url}
                                     alt={item.title || 'Lifestyle Article'}
                                     fill
                                     sizes="(max-width: 768px) 75vw, 30vw"
                                     className="object-cover transition-transform duration-700 group-hover:scale-105"
                                   />
                                 )}
                              </div>
                              <h3 className="font-serif text-2xl font-bold uppercase leading-tight line-clamp-3 group-hover:text-[#1C1917]/70 transition-colors">
                                {item.title}
                              </h3>
                              <p className="mt-3 font-sans text-sm text-[#1C1917]/60 line-clamp-2">
                                {item.excerpt}
                              </p>
                           </Link>
                        ))}
                     </div>
                   </div>
                 )}

                 {/* Magazine Grid (Remaining articles) */}
                 {safeArticles.length > 5 && (
                   <div>
                      <h3 className="font-sans text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-4">
                       Khám Phá <span className="h-px bg-[#1C1917]/20 flex-1" />
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {safeArticles.slice(5).map((item, i) => (
                           <Link key={i} href={`/lifestyle/${item.slug}`} className="group cursor-pointer border-t border-[#1C1917]/10 pt-4">
                              <h3 className="font-serif text-2xl md:text-3xl font-bold uppercase leading-tight mb-3 group-hover:text-[#1C1917]/70 transition-colors">
                                {item.title}
                              </h3>
                              <div className="relative aspect-video w-full overflow-hidden mb-4 bg-black/5">
                                 {item.thumbnail?.url && (
                                   <Image
                                     src={item.thumbnail.url}
                                     alt={item.title || 'Lifestyle Article'}
                                     fill
                                     sizes="(max-width: 768px) 100vw, 35vw"
                                     className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                   />
                                 )}
                              </div>
                              <p className="font-sans text-sm text-[#1C1917]/60 line-clamp-2">
                                {item.excerpt}
                              </p>
                           </Link>
                        ))}
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
                <div className="p-8 border border-[#1C1917] relative">
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
                      <li className="flex gap-4 group cursor-pointer">
                         <span className="text-[#1C1917]/40 font-sans text-sm mt-1">01</span>
                         <span className="group-hover:underline underline-offset-4">Triển lãm nghệ thuật đương đại tại The Factory</span>
                      </li>
                      <li className="flex gap-4 group cursor-pointer">
                         <span className="text-[#1C1917]/40 font-sans text-sm mt-1">02</span>
                         <span className="group-hover:underline underline-offset-4">Thưởng thức Omakase phong cách fusion mới</span>
                      </li>
                      <li className="flex gap-4 group cursor-pointer">
                         <span className="text-[#1C1917]/40 font-sans text-sm mt-1">03</span>
                         <span className="group-hover:underline underline-offset-4">Workshop gốm thủ công cuối tuần</span>
                      </li>
                   </ul>
                </div>

                {/* Newsletter */}
                <div className="bg-[#1C1917] text-[#FAF9F6] p-8">
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
