'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';

// Lazy 3D để không chặn TTI — đúng chuẩn GĐ3/GĐ8
const ParticleNetwork = dynamic(() => import('@/components/3d/ParticleNetwork'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black flex items-center justify-center" aria-hidden="true">
      <div className="font-mono text-xs uppercase tracking-widest text-cyan-400/50 animate-pulse">
        Đang khởi tạo không gian công nghệ số...
      </div>
    </div>
  ),
});

export default function TechTemplate({ articles }: { articles: any[] }) {
  // Use real AI data, but fallback to empty array safely
  const techArticles = articles && articles.length > 0 ? articles : [];
  const topics = ['AI', 'Smartphone', 'Software', 'Startup'];
  const [active, setActive] = useState(0);

  const articlesByTopic = topics.map((t, ti) => {
    const matched = techArticles.filter((a: any) =>
      (a.tags || []).some((tag: string) => tag.toLowerCase().includes(t.toLowerCase()))
    );
    if (matched.length > 0) return matched.slice(0, 3);
    // Fallback: chia đều bài cho 4 cột khi chưa có tag khớp
    return techArticles.filter((_: any, idx: number) => idx % 4 === ti).slice(0, 3);
  });

  return (
    <div className="relative min-h-screen text-white pt-32 pb-20 px-6">
      {/* 3D Background — lazy, có skeleton */}
      <Suspense fallback={<div className="absolute inset-0 bg-black -z-10" aria-hidden="true" />}>
        <ParticleNetwork />
      </Suspense>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Glitch Typography Title — keyframes ngẫu nhiên clip-path + text-shadow */}
        <h1 className="text-5xl md:text-8xl font-mono font-bold tracking-tighter uppercase mb-6 inline-block relative select-none">
          <span className="relative z-10 animate-glitch-main block">CÔNG NGHỆ<span className="text-transparent [-webkit-text-stroke:1px_white]">_TƯƠNG LAI</span></span>
          <span aria-hidden="true" className="absolute inset-0 text-cyan-400 opacity-70 animate-glitch-rgb1">CÔNG NGHỆ_TƯƠNG LAI</span>
          <span aria-hidden="true" className="absolute inset-0 text-red-500 opacity-70 animate-glitch-rgb2">CÔNG NGHỆ_TƯƠNG LAI</span>
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-white/60 mb-12">Trí tuệ nhân tạo / Phần cứng / Phần mềm / Khởi nghiệp — Rê chuột vào từng thẻ để khám phá</p>

        {/* Accordion dọc 4 topics — Framer layout mở rộng/collapse */}
        <div className="flex flex-col md:flex-row gap-4 min-h-[480px] mb-16" role="tablist" aria-label="Tech topics">
          {topics.map((topic, ti) => {
            const isActive = active === ti;
            return (
              <motion.div
                key={topic}
                layout
                onMouseEnter={() => setActive(ti)}
                onClick={() => setActive(ti)}
                role="tab"
                aria-selected={isActive}
                className={`relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-md cursor-pointer transition-colors ${
                  isActive ? 'bg-white/10' : 'bg-white/5 hover:bg-white/[0.07]'
                }`}
                animate={{ flex: isActive ? 3 : 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ minHeight: 200 }}
              >
                <div className={`p-6 h-full flex ${isActive ? 'flex-col' : 'md:flex-col'} gap-4`}>
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest bg-cyan-900/30 px-3 py-1 rounded-full border border-cyan-500/30 w-fit">
                    {topic}
                  </span>
                  {isActive ? (
                    <div className="flex flex-col gap-4 mt-2">
                      {articlesByTopic[ti].length > 0 ? articlesByTopic[ti].map((article: any) => (
                        <Link key={article.slug || article.id} href={`/tech/${article.slug}`} className="group block border-t border-white/10 pt-4">
                          <h3 className="font-mono text-lg font-bold uppercase leading-tight group-hover:text-cyan-300 transition-colors">
                            {article.title}
                          </h3>
                          <p className="font-sans text-sm text-white/60 line-clamp-2 mt-1">{article.excerpt}</p>
                        </Link>
                      )) : (
                        <p className="font-mono text-xs text-white/40 uppercase">Đang chờ cập nhật bài viết mới...</p>
                      )}
                    </div>
                  ) : (
                    <span className="font-mono text-2xl font-bold uppercase [writing-mode:vertical-rl] rotate-180 opacity-60 hidden md:block">
                      {topic}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Glassmorphism Cards Grid (giữ lại cho tất cả bài) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techArticles.map((article) => (
            <Link key={article.id} href={`/tech/${article.slug}`}>
              <div className="h-[480px] border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 flex flex-col group relative">
                {/* Glow effect on hover */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl pointer-events-none" />
                <div className="relative h-48 w-full shrink-0 overflow-hidden">
                  <Image
                    src={article.thumbnail?.url}
                    alt={article.thumbnail?.alt || article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1 relative z-10">
                <div className="relative z-10">
                  <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest bg-cyan-900/30 px-3 py-1 rounded-full border border-cyan-500/30">
                    {article.tags?.[0] || 'Công Nghệ'}
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-mono text-2xl mb-4 font-bold uppercase leading-tight group-hover:text-cyan-300 transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="font-sans text-sm text-white/60 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder for aesthetic */}
          <div className="h-[400px] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col justify-center items-center text-white/30 font-mono text-xs uppercase text-center hover:border-white/50 transition-colors cursor-crosshair">
            <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center mb-4 animate-spin-slow">
              +
            </div>
            Đang đồng bộ dữ liệu mới...
          </div>
        </div>
      </div>
    </div>
  );
}
