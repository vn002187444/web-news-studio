'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';

export default function GameTemplate({ articles }: { articles: any[] }) {
  const gameArticles = articles && articles.length > 0 ? articles : [];
  const displayArticles = [...gameArticles, ...gameArticles, ...gameArticles, ...gameArticles].slice(0, 8);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    try {
      const conn = (navigator as any).connection;
      if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') setVideoOff(true);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setVideoOff(true);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    // Only track on desktop (touch devices don't have pointer: fine)
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

  // Framer Motion for Chromatic Aberration
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  const xRed = useTransform(smoothVelocity, [-1000, 1000], [-15, 15]);
  const xBlue = useTransform(smoothVelocity, [-1000, 1000], [15, -15]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden md:cursor-none">
      
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

      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full z-0 opacity-40 mix-blend-screen pointer-events-none" aria-hidden="true">
        <video 
          autoPlay={!videoOff}
          loop 
          muted 
          playsInline
          preload="none"
          poster="https://cdn.pixabay.com/photo/2020/02/17/32574-393282247_large.jpg"
          className="w-full h-full object-cover grayscale brightness-50 contrast-150"
        >
          <source src="https://cdn.pixabay.com/video/2020/02/17/32574-393282247_large.webm" type="video/webm" />
          <source src="https://cdn.pixabay.com/video/2020/02/17/32574-393282247_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-[1600px] mx-auto">
        
        {/* Chromatic Aberration Title */}
        <div className="relative mb-16 inline-block">
          <motion.h1 
            style={{ x: xRed }}
            className="absolute top-0 left-0 text-7xl md:text-[120px] font-black uppercase tracking-tighter italic text-red-500 mix-blend-screen opacity-70 pointer-events-none"
            aria-hidden="true"
          >
            ESPORTS & GAME
          </motion.h1>
          <motion.h1 
            style={{ x: xBlue }}
            className="absolute top-0 left-0 text-7xl md:text-[120px] font-black uppercase tracking-tighter italic text-blue-500 mix-blend-screen opacity-70 pointer-events-none"
            aria-hidden="true"
          >
            ESPORTS & GAME
          </motion.h1>
          <h1 className="relative text-7xl md:text-[120px] font-black uppercase tracking-tighter italic text-transparent [-webkit-text-stroke:2px_white] hover:[-webkit-text-stroke:2px_white] transition-all duration-300">
            ESPORTS & GAME
          </h1>
        </div>

        {/* Split PC vs Mobile */}
        <div className="flex flex-col lg:flex-row gap-0 mb-20 overflow-hidden rounded-3xl border border-white/20 h-[500px]">
          {/* PC Section */}
          <div className="flex-1 bg-[#111] relative group flex items-center justify-center overflow-hidden border-r border-white/20 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]">
            <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl font-mono text-green-400 uppercase tracking-widest relative z-10 font-bold group-hover:scale-110 transition-transform">
              Đấu Trường PC
            </h2>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/30 blur-[100px] group-hover:bg-green-400/50 transition-colors" />
          </div>
          
          {/* Mobile Section */}
          <div className="flex-1 bg-[#1a1a1a] relative group flex items-center justify-center overflow-hidden [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)] -ml-[10%]">
            <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl font-mono text-pink-400 uppercase tracking-widest relative z-10 font-bold group-hover:-translate-x-10 transition-transform">
              Mobile Gaming
            </h2>
            
            {/* CSS 3D Phone Mockup on Hover */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-96 bg-black border-4 border-gray-800 rounded-3xl translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 shadow-[0_0_50px_rgba(236,72,153,0.3)] flex flex-col p-2 overflow-hidden">
              <div className="w-20 h-4 bg-gray-800 rounded-b-xl mx-auto mb-4" />
              <div className="flex-1 overflow-hidden space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/10 rounded-lg p-2">
                    <div className="w-1/2 h-2 bg-pink-500/50 rounded mb-2" />
                    <div className="w-full h-2 bg-white/20 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/30 blur-[100px] group-hover:bg-pink-400/50 transition-colors" />
          </div>
        </div>

        {/* Tournament Bracket */}
        <div className="mb-20">
          <h3 className="text-2xl font-mono uppercase mb-8 border-b border-white/20 pb-4">Bảng Đấu Esports Mùa Giải Mới</h3>
          <div className="flex justify-between items-center max-w-4xl font-mono text-sm group">
            <div className="flex flex-col gap-8 w-48">
              <div className="border border-white/20 p-4 bg-black relative hover:border-yellow-500 transition-colors">
                <span className="text-yellow-500">THẮNG:</span> Team Alpha
                <div className="absolute top-1/2 -right-12 w-12 h-[1px] bg-white/20 group-hover:bg-yellow-500 transition-colors overflow-hidden">
                  <div className="w-full h-full bg-yellow-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                </div>
              </div>
              <div className="border border-white/20 p-4 bg-black relative hover:border-white/50 transition-colors">
                <span className="text-white/50">THUA:</span> Team Beta
                <div className="absolute top-1/2 -right-12 w-12 h-[1px] bg-white/20 group-hover:bg-yellow-500 transition-colors" />
                <div className="absolute top-[-2rem] -right-12 w-[1px] h-[4rem] bg-white/20 group-hover:bg-yellow-500 transition-colors" />
              </div>
            </div>
            
            <div className="border border-yellow-500/50 p-6 bg-black relative shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <span className="text-yellow-400 font-bold">VÔ ĐỊCH:</span> Team Alpha
              <div className="absolute top-1/2 -left-12 w-12 h-[1px] bg-white/20 group-hover:bg-yellow-500 transition-colors overflow-hidden">
                 <div className="w-full h-full bg-yellow-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 delay-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayArticles.map((article, i) => (
            <Link key={i} href={`/game/${article.slug}`} className="block group">
              <div className="relative h-[300px] border border-white/20 bg-black/50 p-6 overflow-hidden md:hover:!scale-100 md:group-hover:scale-100 active:scale-95 transition-transform">
                {/* Glitch hover effect */}
                <div className="absolute inset-0 bg-red-600 translate-x-full md:group-hover:translate-x-0 transition-transform duration-300 ease-in-out -z-10 mix-blend-difference" />
                
                <h3 className="font-mono text-xl font-bold uppercase mb-2 md:group-hover:text-black transition-colors delay-100 line-clamp-3">
                  {article.title}
                </h3>
                
                <div className="absolute bottom-6 left-6 font-mono text-[10px] tracking-widest uppercase opacity-50 md:group-hover:text-black md:group-hover:opacity-100">
                  {article.publishedAt ? article.publishedAt.split('T')[0] : '2026'} // ĐÃ XÁC THỰC
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
