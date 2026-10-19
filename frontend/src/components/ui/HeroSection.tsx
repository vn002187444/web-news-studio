'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface HeroArticle {
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  thumbnail: { url: string; alt: string };
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';

export default function HeroSection({ article }: { article?: HeroArticle }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Typography */}
        <div className="lg:col-span-7 z-10">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[105px] xl:text-[120px] leading-[1.08] font-serif tracking-normal uppercase mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Tương Lai <br className="hidden sm:inline" />
            <span className="italic font-light">Đã</span> Bắt Đầu
          </motion.h1>
          
          <motion.p 
            className="font-mono text-sm uppercase max-w-md mt-8 border-l-2 border-[#111111] pl-4 text-gray-800 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Khám phá những điểm giao thoa giữa Công nghệ, Blockchain và Phong cách sống thế hệ mới.
          </motion.p>

          {article && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mt-8 max-w-md"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-600">
                Tin mới nhất — {article.category}
              </span>
              <Link
                href={`/${article.category}/${article.slug}`}
                className="block mt-2 font-serif text-xl font-bold leading-snug hover:underline underline-offset-4"
                data-cursor="READ"
              >
                {article.title}
              </Link>
            </motion.div>
          )}
        </div>

        {/* Right: Parallax Image — ảnh bài mới nhất */}
        <div className="lg:col-span-5 h-[500px] lg:h-[700px] w-full relative overflow-hidden bg-gray-200 group">
          {article && (
            <Link href={`/${article.category}/${article.slug}`} className="absolute inset-0 z-20" data-cursor="READ" aria-label={article.title} />
          )}
          <motion.div style={{ y }} className="w-full h-[120%] -top-[10%] relative">
            <Image 
              src={article?.thumbnail.url || FALLBACK_IMG}
              alt={article?.thumbnail.alt || 'Retro Tech Setup'}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              priority
            />
          </motion.div>
          {article && (
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none">
              <span className="font-mono text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white">
                {article.category}
              </span>
              <p className="mt-2 text-white font-serif text-lg leading-snug line-clamp-2">
                {article.title}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
