'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function EntertainmentTemplate({ articles }: { articles: any[] }) {
  const entertainmentArticles = articles && articles.length > 0 ? articles : [];
  
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#1c0024] text-[#e5d08f] font-sans selection:bg-[#e5d08f] selection:text-[#1c0024]">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter mb-4 text-[#e5d08f] text-center">
          Showbiz
        </h1>
        
        {/* Marquee */}
        <div className="overflow-hidden whitespace-nowrap border-y border-[#e5d08f]/30 py-2 mb-16">
          <div className="inline-block animate-[marquee_20s_linear_infinite] uppercase font-mono text-xs tracking-widest">
            {/* Using arbitrary names for the marquee effect */}
            LATEST RELEASES • HOLLYWOOD INSIDER • RED CARPET LOOKS • BOX OFFICE HITS • TRENDING ARTISTS • LATEST RELEASES • HOLLYWOOD INSIDER • RED CARPET LOOKS • BOX OFFICE HITS • TRENDING ARTISTS •
          </div>
        </div>

        {/* Cinematic Poster Wall */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {entertainmentArticles.map((article, i) => (
            <Link key={i} href={`/entertainment/${article.slug}`} className="group relative block aspect-[2/3] overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100" />
              <Image 
                src={article.thumbnail?.url || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80'} 
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase border border-white/30 px-2 py-1 rounded">Exclusive</span>
                <h3 className="text-xl md:text-2xl font-serif italic mt-4 text-white leading-tight">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
