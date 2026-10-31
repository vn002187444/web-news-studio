'use client';

import AdaptiveImage from '@/components/ui/AdaptiveImage';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { optimizeThumbnail } from '@/lib/image';

export default function GameTemplate({ articles }: { articles: any[] }) {
  const gameArticles = articles && articles.length > 0 ? articles : [];
  const [featured, ...rest] = gameArticles;
  const gridArticles = rest.slice(0, 6);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Chromatic aberration theo tốc độ cuộn
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const xRed = useTransform(smoothVelocity, [-1000, 1000], [-15, 15]);
  const xBlue = useTransform(smoothVelocity, [-1000, 1000], [15, -15]);

  const fmtDate = (d?: string) => {
    try {
      return d ? new Date(d).toLocaleDateString('vi-VN') : '';
    } catch {
      return '';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Custom Crosshair Cursor */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-8 h-8 pointer-events-none z-[999] mix-blend-difference"
        aria-hidden="true"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          rotate: clicked ? 45 : 0,
          scale: clicked ? 0.8 : 1,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      >
        <div className={`absolute top-1/2 left-0 w-full h-[1px] ${clicked ? 'bg-red-500' : 'bg-white'}`} />
        <div className={`absolute top-0 left-1/2 w-[1px] h-full ${clicked ? 'bg-red-500' : 'bg-white'}`} />
        <div className={`absolute top-1/2 left-1/2 w-4 h-4 border ${clicked ? 'border-red-500' : 'border-white'} rounded-full -translate-x-1/2 -translate-y-1/2`} />
      </motion.div>

      {/* Nền lưới CSS thuần (thay video pixabay nặng) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,222,128,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.35) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-green-500/15 blur-[140px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-[1600px] mx-auto">
        {/* Chromatic Aberration Title */}
        <div className="relative mb-6 inline-block">
          <motion.h1
            style={{ x: xRed }}
            className="absolute top-0 left-0 text-3xl sm:text-5xl md:text-[110px] font-black uppercase tracking-tighter italic text-red-500 mix-blend-screen opacity-70 pointer-events-none sm:whitespace-nowrap"
            aria-hidden="true"
          >
            ESPORTS &amp; GAME
          </motion.h1>
          <motion.h1
            style={{ x: xBlue }}
            className="absolute top-0 left-0 text-3xl sm:text-5xl md:text-[110px] font-black uppercase tracking-tighter italic text-blue-500 mix-blend-screen opacity-70 pointer-events-none sm:whitespace-nowrap"
            aria-hidden="true"
          >
            ESPORTS &amp; GAME
          </motion.h1>
          <h1 className="relative text-3xl sm:text-5xl md:text-[110px] font-black uppercase tracking-tighter italic text-transparent [-webkit-text-stroke:2px_white]">
            ESPORTS &amp; GAME
          </h1>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-400/80 mb-14">
          Tin Esports // PC // Mobile — cập nhật mỗi ngày
        </p>

        {gameArticles.length === 0 && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/40 border border-dashed border-white/20 rounded-2xl p-8 text-center">
            Chưa có bài Game — chạy autoblog để sinh nội dung.
          </p>
        )}

        {/* Bài nổi bật */}
        {featured && (
          <Link href={`/game/${featured.slug}`} className="group block mb-14" data-cursor="PLAY">
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/15 bg-white/[0.03] hover:border-green-400/50 transition-colors">
              <div className="relative h-72 lg:h-[420px] overflow-hidden">
                <AdaptiveImage
                  src={featured.thumbnail}
                  alt={featured.title}
                  category="game"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest bg-green-400 text-black font-bold px-3 py-1 rounded-full">
                  Nổi bật
                </span>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="font-mono text-[11px] uppercase tracking-widest text-green-400 mb-4">
                  {(featured.tags?.[0] || 'Esports')} — {fmtDate(featured.publishedAt)}
                </div>
                <h2 className="font-serif text-3xl lg:text-5xl font-bold leading-tight mb-5 group-hover:underline decoration-green-400 underline-offset-8">
                  {featured.title}
                </h2>
                <p className="text-white/60 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <span className="mt-6 font-mono text-xs uppercase tracking-widest text-white/80 group-hover:text-green-300 transition-colors">
                  Đọc tiếp →
                </span>
              </div>
            </article>
          </Link>
        )}

        {/* Lưới bài mới */}
        {gridArticles.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8 border-b border-white/15 pb-4">
              <h3 className="font-mono text-sm uppercase tracking-[0.25em] text-white/80">Mới nhất</h3>
              <span className="font-mono text-[11px] text-green-400/80 tabular-nums">
                {String(gridArticles.length).padStart(2, '0')} bài
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridArticles.map((article, i) => (
                <Link key={article.slug || i} href={`/game/${article.slug}`} className="group" data-cursor="READ">
                  <article className="h-full rounded-2xl overflow-hidden border border-white/12 bg-white/[0.02] hover:border-green-400/40 hover:bg-white/[0.05] transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <AdaptiveImage
                        src={article.thumbnail}
                        alt={article.title}
                        category="game"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-black/70 backdrop-blur px-2.5 py-1 rounded-full text-green-300 border border-green-400/30">
                        {article.tags?.[0] || 'Game'}
                      </span>
                      <span className="absolute top-3 right-3 font-mono text-[10px] tabular-nums text-white/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="font-serif text-xl font-bold leading-snug mb-2 line-clamp-2 group-hover:underline decoration-green-400 underline-offset-4">
                        {article.title}
                      </h4>
                      <p className="text-sm text-white/50 line-clamp-2 mb-3">{article.excerpt}</p>
                      <time className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                        {fmtDate(article.publishedAt)}
                      </time>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
