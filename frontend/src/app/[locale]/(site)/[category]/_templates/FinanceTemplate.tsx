'use client';

import dynamic from 'next/dynamic';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

// Dynamically import the chart to avoid SSR issues with canvas
const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false, loading: () => <div className="w-full h-[400px] lg:h-[600px] bg-[#111111] animate-pulse" /> });

export default function FinanceTemplate({ articles }: { articles: any[] }) {
  const financeArticles = articles && articles.length > 0 ? articles : [];
  
  // Fake ticker data for Watchlist
  const [tickers, setTickers] = useState([
    { id: 'btc', symbol: 'BTC/USD', price: '65,241.00', change: '+2.4%', history: [64000, 64500, 64200, 65000, 65241] },
    { id: 'eth', symbol: 'ETH/USD', price: '3,450.50', change: '-1.2%', history: [3500, 3550, 3480, 3460, 3450] },
    { id: 'sol', symbol: 'SOL/USD', price: '145.20', change: '+5.6%', history: [135, 138, 142, 140, 145] },
    { id: 'nvda', symbol: 'NVDA', price: '1,250.00', change: '+1.1%', history: [1220, 1230, 1225, 1240, 1250] },
  ]);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newTickers = [...tickers];
    const item = newTickers.splice(draggedIdx, 1)[0];
    newTickers.splice(idx, 0, item);
    setTickers(newTickers);
    setDraggedIdx(null);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#F4F4F0] text-[#111111]">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Market Overview Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 border-b border-[#111111]/20 pb-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tighter uppercase">
              Thị Trường <br /> <span className="italic font-light text-red-600">Trực Tiếp</span>
            </h1>
          </div>
          
          <div className="flex gap-6 mt-8 lg:mt-0 font-mono text-sm tabular-nums flex-wrap">
            {tickers.map((t, i) => (
              <div 
                key={t.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                className="flex flex-col cursor-move group relative"
              >
                <span className="text-gray-500 hover:text-black transition-colors">{t.symbol}</span>
                <span className="text-xl font-bold">{t.price}</span>
                <span className={t.change.startsWith('+') ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                  {t.change}
                </span>
                
                {/* Mini sparkline tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#111] p-2 pointer-events-none w-[80px] h-[40px] z-10 border border-white/20">
                  <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke={t.change.startsWith('+') ? '#26a69a' : '#ef5350'}
                      strokeWidth="2"
                      points={t.history.map((val, idx, arr) => {
                        const min = Math.min(...arr);
                        const max = Math.max(...arr);
                        const x = (idx / (arr.length - 1)) * 100;
                        const y = 50 - ((val - min) / ((max - min) || 1)) * 50;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-16 bg-[#111111] p-6 border border-[#111111] shadow-none">
          <div className="flex justify-between items-center mb-6 text-white font-mono tabular-nums">
            <div>
              <h2 className="text-2xl font-bold">BTC/USD <span className="text-sm font-normal text-gray-400">REALTIME STREAM</span></h2>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="px-3 py-1 bg-white/10 hover:bg-white/20">15M</button>
              <button className="px-3 py-1 bg-white/20 hover:bg-white/30">1H</button>
              <button className="px-3 py-1 bg-white/10 hover:bg-white/20">4H</button>
            </div>
          </div>
          
          <TradingChart />
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-3">
             <h3 className="font-mono uppercase tracking-widest text-sm mb-6 border-b border-[#111111]/20 pb-2">Báo Cáo & Phân Tích Chuyên Sâu Mới Nhất</h3>
          </div>
          {financeArticles.length === 0 ? (
            <div className="col-span-3 text-center py-12 border border-dashed border-gray-300 font-mono text-xs uppercase text-gray-500">
              Đang chờ dữ liệu phân tích tài chính mới từ hệ thống...
            </div>
          ) : (
            financeArticles.slice(0, 6).map((article, i) => (
              <Link key={i} href={`/finance/${article?.slug}`} className="group">
                <div className="border border-[#111111]/10 p-6 h-full hover:bg-white transition-colors shadow-none">
                  <span className="font-mono text-[10px] text-red-600 uppercase font-semibold">Tài Chính</span>
                  <h4 className="font-serif text-2xl font-bold mt-4 mb-3 group-hover:underline decoration-1 underline-offset-4 line-clamp-3">
                    {article?.title}
                  </h4>
                  <p className="font-sans text-sm text-gray-600 line-clamp-3">
                    {article?.excerpt}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
