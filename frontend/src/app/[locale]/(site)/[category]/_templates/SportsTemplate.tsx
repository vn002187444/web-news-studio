'use client';

import Link from 'next/link';

export default function SportsTemplate({ articles }: { articles: any[] }) {
  const sportsArticles = articles && articles.length > 0 ? articles : [];
  
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-black text-[#39ff14] font-mono selection:bg-[#39ff14] selection:text-black">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-12">
          Live <span className="text-white">Scoreboard</span>
        </h1>
        
        {/* Ticker / Live Scores */}
        <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide tabular-nums">
          {[1, 2, 3, 4].map((match) => (
            <div key={match} className="flex-shrink-0 border border-[#39ff14]/30 p-4 min-w-[250px] relative overflow-hidden group hover:border-[#39ff14] transition-colors">
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="text-xs text-white/50 mb-2">PREMIER LEAGUE - 75'</div>
              <div className="flex justify-between items-center text-xl font-bold text-white">
                <span>MUN</span> <span className="text-[#39ff14]">2 - 1</span> <span>ARS</span>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {sportsArticles.map((article, i) => (
              <Link key={i} href={`/sports/${article.slug}`} className="group block border border-[#39ff14]/20 p-6 hover:bg-[#39ff14]/5 transition-colors">
                {article.thumbnail?.url && (
                  <div className="w-full h-44 mb-4 overflow-hidden border border-[#39ff14]/20 relative bg-black">
                    <img 
                      src={article.thumbnail.url} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                      loading="lazy" 
                    />
                  </div>
                )}
                <span className="text-[10px] text-white/50 uppercase">Breaking News</span>
                <h3 className="text-2xl font-bold mt-2 text-white group-hover:text-[#39ff14] transition-colors uppercase leading-tight">
                  {article.title}
                </h3>
                <p className="mt-4 text-sm text-white/70 line-clamp-3">{article.excerpt}</p>
              </Link>
            ))}
          </div>
          
          {/* Sticky Ranking Table */}
          <div className="col-span-1">
            <div className="sticky top-32 border border-[#39ff14]/30 p-6 tabular-nums">
              <h3 className="text-xl font-bold text-white mb-4 uppercase border-b border-[#39ff14]/30 pb-2">Standings</h3>
              <ul className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <li key={i} className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                    <span className="text-white"><span className="text-white/50 mr-2">{i+1}</span> Team {String.fromCharCode(65+i)}</span>
                    <span className="text-[#39ff14] font-bold">{100 - i * 5} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
