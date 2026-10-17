'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

interface MatchItem {
  id: string;
  league: "Ngoại Hạng Anh" | "Champions League" | "NBA" | "V-League";
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  score1: number | null;
  score2: number | null;
  status: "LIVE" | "FT" | "UPCOMING";
  time: string;
}

export function detectSportSubCategory(article: { title?: string; excerpt?: string; tags?: string[]; subCategory?: string }): string {
  if (article.subCategory) return article.subCategory;
  const text = `${article.title || ''} ${(article.tags || []).join(' ')} ${article.excerpt || ''}`.toLowerCase();
  
  if (/f1|formula 1|đua xe|verstappen|hamilton|ferrari|motogp|grand prix|tay đua/.test(text)) return 'Đua Xe F1';
  if (/esports|thể thao điện tử|liên minh|lmht|dota|t1|faker|cs2|valorant|lck|vcs|cktg|game thủ/.test(text)) return 'Esports';
  if (/tennis|quần vợt|alcaraz|djokovic|sabalenka|nadal|federer|atp|wta|thượng hải masters|us open|wimbledon|roland garros|sinner|banh nỉ/.test(text)) return 'Quần Vợt';
  if (/bóng rổ|nba|lakers|warriors|curry|lebron|celtics|vba|basketball/.test(text)) return 'Bóng Rổ';
  if (/hậu trường|vạ miệng|nghĩa vụ quân sự|scandal|tẩy chay|đời tư|lương|chỉ trích|chia tay|bạn gái|vợ|huyền thoại romario/.test(text)) return 'Hậu Trường';
  if (/bóng đá|champions league|v-league|football|soccer|la liga|premier league|bundesliga|man utd|chelsea|arsenal|barca|real madrid|bayern|ronaldo|messi|kane|fifa|asean cup|công an hà nội|inter miami/.test(text)) return 'Bóng Đá';
  
  return 'Bóng Đá';
}

export default function SportsTemplate({ articles }: { articles: any[] }) {
  const sportsArticles = articles && articles.length > 0 ? articles : [];
  
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [activeLeagueFilter, setActiveLeagueFilter] = useState("Tất cả");
  const [activeSportFilter, setActiveSportFilter] = useState("Tất cả");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"Standings" | "Fixtures">("Standings");

  const LEAGUE_FILTERS = ["Tất cả", "Ngoại Hạng Anh", "Champions League", "V-League", "NBA"];
  const SPORT_FILTERS = ["Tất cả", "Bóng Đá", "Esports", "Quần Vợt", "Bóng Rổ", "Đua Xe F1", "Hậu Trường"];

  useEffect(() => {
    const fetchMatches = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/sports/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
      }
    };

    fetchMatches();
    const intervalId = setInterval(fetchMatches, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Đếm số bài viết phân bổ theo từng chuyên mục con
  const subCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Tất cả": sportsArticles.length };
    SPORT_FILTERS.slice(1).forEach(sub => {
      counts[sub] = sportsArticles.filter(a => detectSportSubCategory(a) === sub).length;
    });
    return counts;
  }, [sportsArticles]);

  // Lọc bài viết theo chuyên mục con đang được chọn
  const filteredArticles = useMemo(() => {
    if (activeSportFilter === "Tất cả") return sportsArticles;
    return sportsArticles.filter(a => detectSportSubCategory(a) === activeSportFilter);
  }, [sportsArticles, activeSportFilter]);

  const filteredMatches = activeLeagueFilter === "Tất cả" 
    ? matches 
    : matches.filter(m => m.league === activeLeagueFilter);

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#08090C] text-white font-sans selection:bg-[#00F59B] selection:text-black">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header & Sport Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#00F59B] block mb-2">
              Sports Network 24/7
            </span>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter">
              Live <span className="text-[#00F59B]">Sports</span>
            </h1>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
             {SPORT_FILTERS.map(filter => {
               const count = subCategoryCounts[filter] || 0;
               const isActive = activeSportFilter === filter;
               return (
                 <button
                   key={filter}
                   onClick={() => setActiveSportFilter(filter)}
                   className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold uppercase transition-all flex items-center gap-2 ${
                     isActive 
                       ? 'bg-[#FF5722] text-white shadow-lg shadow-[#FF5722]/30 scale-105' 
                       : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                   }`}
                 >
                   <span>{filter}</span>
                   <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                     isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/40'
                   }`}>
                     {count}
                   </span>
                 </button>
               );
             })}
          </div>
        </div>
        
        {/* Ticker / Live Scores Filters */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
          {LEAGUE_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveLeagueFilter(filter)}
              className={`pb-2 text-sm font-bold uppercase transition-colors relative ${activeLeagueFilter === filter ? 'text-[#00F59B]' : 'text-white/50 hover:text-white'}`}
            >
              {filter}
              {activeLeagueFilter === filter && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F59B]" />
              )}
            </button>
          ))}
        </div>

        {/* Ticker / Live Scores Data */}
        <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide tabular-nums">
          {filteredMatches.length === 0 ? (
             <div className="text-white/50 text-sm italic py-4">Đang cập nhật tỉ số...</div>
          ) : (
            filteredMatches.map((match) => (
              <div key={match.id} className="flex-shrink-0 border border-white/10 bg-white/5 p-4 min-w-[280px] rounded-xl relative overflow-hidden group hover:border-[#00F59B]/50 transition-colors flex flex-col justify-center">
                {match.status === "LIVE" && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                )}
                
                <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-3">
                  {match.league} <span className={match.status === 'LIVE' ? 'text-[#FF5722]' : ''}>• {match.time}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <div className="flex items-center gap-2">
                       {match.team1Logo ? <img src={match.team1Logo} alt={match.team1} className="w-5 h-5 object-contain" /> : <div className="w-5 h-5 bg-white/10 rounded-full" />}
                       <span className="truncate max-w-[120px]">{match.team1}</span>
                    </div>
                    <span className={match.status === 'LIVE' ? 'text-[#00F59B]' : 'text-white/80'}>{match.score1 ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <div className="flex items-center gap-2">
                       {match.team2Logo ? <img src={match.team2Logo} alt={match.team2} className="w-5 h-5 object-contain" /> : <div className="w-5 h-5 bg-white/10 rounded-full" />}
                       <span className="truncate max-w-[120px]">{match.team2}</span>
                    </div>
                    <span className={match.status === 'LIVE' ? 'text-[#00F59B]' : 'text-white/80'}>{match.score2 ?? '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grid Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="col-span-1 lg:col-span-3">
            {filteredArticles.length > 0 ? (
               <div className="flex flex-col gap-8">
                  {/* Hero Spotlight (First Article) */}
                  <Link href={`/sports/${filteredArticles[0].slug}`} className="group block relative overflow-hidden rounded-2xl bg-black border border-white/10 hover:border-[#00F59B]/50 transition-colors">
                     <div className="relative aspect-video w-full overflow-hidden">
                        {filteredArticles[0].thumbnail?.url && (
                          <Image
                            src={filteredArticles[0].thumbnail.url}
                            alt={filteredArticles[0].thumbnail.alt || filteredArticles[0].title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 75vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/50 to-transparent" />
                     </div>
                     <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                       <div className="flex items-center gap-2 mb-4">
                         <span className="inline-block bg-[#00F59B] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                           Tâm Điểm
                         </span>
                         <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                           {detectSportSubCategory(filteredArticles[0])}
                         </span>
                       </div>
                       <h2 className="text-3xl md:text-5xl font-black text-white group-hover:text-[#00F59B] transition-colors uppercase leading-tight max-w-4xl">
                         {filteredArticles[0].title}
                       </h2>
                       <p className="mt-4 text-base md:text-lg text-white/70 line-clamp-2 max-w-3xl">
                         {filteredArticles[0].excerpt}
                       </p>
                     </div>
                  </Link>

                  {/* Bento Grid (Remaining Articles) */}
                  {filteredArticles.length > 1 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredArticles.slice(1).map((article, i) => {
                           const subCat = detectSportSubCategory(article);
                           return (
                            <Link key={i} href={`/sports/${article.slug}`} className="group flex flex-col border border-white/10 bg-white/5 rounded-2xl overflow-hidden hover:border-[#00F59B]/30 hover:bg-white/10 transition-all">
                               <div className="relative aspect-video w-full overflow-hidden">
                                 {article.thumbnail?.url ? (
                                   <Image
                                     src={article.thumbnail.url}
                                     alt={article.thumbnail.alt || article.title}
                                     fill
                                     sizes="(max-width: 768px) 100vw, 35vw"
                                     className="object-cover transition-transform duration-500 group-hover:scale-105"
                                   />
                                 ) : (
                                   <div className="w-full h-full bg-white/5" />
                                 )}
                                 <div className="absolute top-3 left-3">
                                   <span className="inline-block bg-black/70 backdrop-blur-md text-[#00F59B] border border-[#00F59B]/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                     {subCat}
                                   </span>
                                 </div>
                               </div>
                               <div className="p-6 flex flex-col flex-grow">
                                 <h3 className="text-xl font-bold text-white group-hover:text-[#00F59B] transition-colors uppercase leading-tight line-clamp-2">
                                   {article.title}
                                 </h3>
                                 <p className="mt-3 text-sm text-white/60 line-clamp-2">
                                   {article.excerpt}
                                 </p>
                                 <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest">
                                   <span className="text-[#00F59B]/80 font-medium">{subCat}</span>
                                   <span className="group-hover:text-white transition-colors">Đọc tiếp →</span>
                                 </div>
                               </div>
                            </Link>
                           );
                        })}
                     </div>
                  )}
               </div>
            ) : (
               <div className="border border-white/10 bg-white/5 rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase mb-2">
                    Chuyên mục {activeSportFilter} đang được cập nhật
                  </h3>
                  <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
                    Ban biên tập đang liên tục tổng hợp các tin tức, diễn biến mới nhất về {activeSportFilter}. Vui lòng quay lại sau ít phút hoặc xem các môn thể thao khác.
                  </p>
                  <button 
                    onClick={() => setActiveSportFilter("Tất cả")}
                    className="px-6 py-2.5 rounded-full bg-[#00F59B] text-black font-bold uppercase text-xs hover:bg-white transition-colors"
                  >
                    Xem tất cả tin thể thao
                  </button>
               </div>
            )}
          </div>
          
          {/* Sidebar Widget (Standings / Fixtures) */}
          <div className="col-span-1">
            <div className="sticky top-32 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10">
                 <button 
                   onClick={() => setActiveSidebarTab("Standings")}
                   className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeSidebarTab === "Standings" ? 'bg-[#00F59B]/10 text-[#00F59B] border-b-2 border-[#00F59B]' : 'text-white/50 hover:bg-white/5'}`}
                 >
                   BXH
                 </button>
                 <button 
                   onClick={() => setActiveSidebarTab("Fixtures")}
                   className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeSidebarTab === "Fixtures" ? 'bg-[#00F59B]/10 text-[#00F59B] border-b-2 border-[#00F59B]' : 'text-white/50 hover:bg-white/5'}`}
                 >
                   Lịch Thi Đấu
                 </button>
              </div>
              
              <div className="p-6 tabular-nums">
                {activeSidebarTab === "Standings" ? (
                   <div>
                     <div className="flex text-xs text-white/40 font-bold uppercase mb-4 px-2">
                        <div className="w-8">#</div>
                        <div className="flex-1">Đội</div>
                        <div className="w-8 text-right">Pts</div>
                     </div>
                     <ul className="space-y-3">
                       {[
                         { name: "Arsenal", pts: 64, form: "W" },
                         { name: "Liverpool", pts: 63, form: "W" },
                         { name: "Man City", pts: 62, form: "D" },
                         { name: "Aston Villa", pts: 55, form: "L" },
                         { name: "Tottenham", pts: 53, form: "W" },
                       ].map((team, i) => (
                         <li key={i} className="flex items-center text-sm bg-white/5 rounded-lg p-2">
                           <span className="w-8 text-white/50 font-bold">{i+1}</span>
                           <span className="flex-1 text-white font-bold">{team.name}</span>
                           <span className="w-8 text-right text-[#00F59B] font-bold">{team.pts}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                ) : (
                   <div>
                      <ul className="space-y-4">
                       {[
                         { time: "22:00 Hôm nay", home: "Chelsea", away: "Man Utd" },
                         { time: "00:30 Ngày mai", home: "Newcastle", away: "Everton" },
                         { time: "02:00 Ngày mai", home: "Brighton", away: "Brentford" },
                       ].map((fixture, i) => (
                         <li key={i} className="text-sm bg-white/5 rounded-lg p-3">
                           <div className="text-xs text-[#FF5722] font-bold mb-2">{fixture.time}</div>
                           <div className="flex justify-between items-center font-bold">
                              <span>{fixture.home}</span>
                              <span className="text-white/30 text-xs px-2">vs</span>
                              <span>{fixture.away}</span>
                           </div>
                         </li>
                       ))}
                     </ul>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
