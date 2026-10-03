'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import VelocitySkew from './VelocitySkew';

interface BentoGridProps {
  articles: any[];
}

const CATEGORY_NAMES: Record<string, string> = {
  tech: 'Công Nghệ',
  blockchain: 'Blockchain',
  game: 'Esports',
  finance: 'Tài Chính',
  lifestyle: 'Đời Sống',
  sports: 'Thể Thao',
  entertainment: 'Giải Trí',
  education: 'Giáo Dục',
  science: 'Khoa Học',
};

export default function BentoGrid({ articles }: BentoGridProps) {
  // Use passed articles, fallback to empty array if none
  const displayArticles = articles && articles.length > 0 ? articles.slice(0, 5) : [];

  return (
    <section className="py-20 px-6 bg-white text-black">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif uppercase tracking-tight mb-12 border-b border-black pb-4">
          Tiêu Điểm & <span className="font-light italic">Bài Viết Mới</span>
        </h2>
        
        <VelocitySkew>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[400px]">
            {displayArticles.map((article, i) => (
              <motion.div 
                key={article.slug || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative group overflow-hidden bg-gray-100 ${
                  i === 0 ? 'md:col-span-2 md:row-span-2' : 
                  i === 1 ? 'md:col-span-2 lg:col-span-1 row-span-1' : 
                  'col-span-1 row-span-1'
                }`}
              >
                <Link href={`/${article.category}/${article.slug}`} className="absolute inset-0 z-20" data-cursor="READ" />
                
                <Image 
                  src={article.thumbnail.url}
                  alt={article.thumbnail.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-10 text-white flex flex-col justify-end">
                  <div className="mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {CATEGORY_NAMES[article.category] || article.category}
                    </span>
                  </div>
                  <h3 className={`${i === 0 ? 'text-2xl md:text-3xl lg:text-4xl mb-3' : 'text-lg md:text-xl mb-2'} font-serif font-bold uppercase leading-snug line-clamp-3`}>
                    {article.title}
                  </h3>
                  {i === 0 && (
                    <p className="font-mono text-xs text-white/80 line-clamp-2 max-w-lg leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* A purely decorative Bento Box */}
            <motion.div 
               className="bg-[#111111] text-white p-8 flex flex-col justify-between cursor-pointer border border-white/10 rounded-none hover:bg-neutral-900 transition-colors"
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               data-cursor="JOIN"
            >
               <div>
                 <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest block mb-2">Đặc Quyền Độc Giả</span>
                 <h3 className="font-serif text-3xl italic">Bản Tin Chuyên Sâu</h3>
               </div>
               <p className="font-mono text-xs uppercase opacity-60 mt-auto">Đăng ký nhận báo cáo phân tích công nghệ & tài chính mỗi sáng.</p>
            </motion.div>
          </div>
        </VelocitySkew>
      </div>
    </section>
  );
}
