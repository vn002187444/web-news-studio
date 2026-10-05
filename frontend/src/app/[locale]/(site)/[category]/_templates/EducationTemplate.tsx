'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function EducationTemplate({ articles }: { articles: any[] }) {
  const eduArticles = articles && articles.length > 0 ? articles : [];
  
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#faf9f6] text-[#1c355e] font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif text-[#1c355e] tracking-tight mb-4">
            Campus <span className="italic text-[#0047AB]">Editorial</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Hành trình học vấn, định hướng nghề nghiệp và cơ hội học bổng dành cho Gen Z.
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex justify-center gap-4 mb-16 flex-wrap">
          {['Tất cả', 'Học bổng', 'Việc làm', 'Du học', 'Kỹ năng'].map(tag => (
            <button key={tag} className="px-6 py-2 rounded-full border border-[#1c355e]/20 hover:bg-[#0047AB] hover:text-white hover:border-[#0047AB] transition-colors text-sm font-medium">
              {tag}
            </button>
          ))}
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l border-[#1c355e]/10 pl-8 ml-4 md:ml-0 md:border-none md:pl-0">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#1c355e]/10 -translate-x-1/2" />
          
          <div className="space-y-16">
            {eduArticles.map((article, i) => (
              <div key={i} className={`relative md:flex items-center justify-between gap-16 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Timeline Dot */}
                <div className="absolute left-[-37px] md:left-1/2 top-0 md:top-1/2 w-4 h-4 rounded-full bg-[#0047AB] border-4 border-[#faf9f6] md:-translate-x-1/2 md:-translate-y-1/2 z-10" />
                
                <div className="md:w-1/2" />
                
                <Link href={`/education/${article.slug}`} className="md:w-1/2 group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-[#1c355e]/5 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={article.thumbnail?.url}
                      alt={article.thumbnail?.alt || article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-[#0047AB] uppercase tracking-wider bg-[#0047AB]/10 px-3 py-1 rounded-full">
                      Trending
                    </span>
                    <button className="text-gray-400 hover:text-[#0047AB] transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-[#0047AB] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
