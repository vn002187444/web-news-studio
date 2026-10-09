'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';

// Dynamically import the chart to avoid SSR issues with canvas
const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false, loading: () => <div className="w-full h-[400px] lg:h-[600px] bg-[#111111] animate-pulse" /> });
import { CHART_SYMBOLS, CHART_INTERVALS } from '@/components/charts/chartMeta';

export default function FinanceTemplate({ articles }: { articles: any[] }) {
  const financeArticles = articles && articles.length > 0 ? articles : [];
  const [chartSymbol, setChartSymbol] = useState<string>('BTCUSDT');
  const [chartInterval, setChartInterval] = useState<string>('1m');
  const chartLabel = CHART_SYMBOLS.find((s) => s.id === chartSymbol)?.label ?? chartSymbol;
  
  // Watchlist giá THẬT — Binance 24hr ticker, poll 15s, dừng khi tab ẩn.
  // Lịch sử sparkline tích lũy từ các lần poll (không bịa sẵn).
  const WATCH_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];
  type Ticker = { id: string; symbol: string; price: string; change: string; up: boolean; history: number[] };
  const [tickers, setTickers] = useState<Ticker[]>(WATCH_SYMBOLS.map((id) => ({
    id, symbol: id.replace('USDT', '') + '/USD', price: '—', change: '—', up: true, history: [],
  })));
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(WATCH_SYMBOLS))}`,
          { cache: 'no-store' }
        );
        if (!r.ok || stop) return;
        const arr = await r.json();
        if (stop || !Array.isArray(arr)) return;
        setTickers((prev) => arr.map((d: any) => {
          const id = String(d.symbol);
          const price = Number(d.lastPrice);
          const pct = Number(d.priceChangePercent);
          const old = prev.find((p) => p.id === id);
          return {
            id,
            symbol: id.replace('USDT', '') + '/USD',
            price: Number.isFinite(price)
              ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: price < 10 ? 4 : 2 })
              : '—',
            change: Number.isFinite(pct) ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '—',
            up: pct >= 0,
            history: Number.isFinite(price) ? [...(old?.history ?? []).slice(-29), price] : (old?.history ?? []),
          };
        }));
      } catch { /* giữ giá cũ khi Binance chặn */ }
    };
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, 15000);
    return () => { stop = true; clearInterval(timer); };
  }, []);

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
                onClick={() => setChartSymbol(t.id)}
                title="Bấm để xem biểu đồ"
                className={`flex flex-col cursor-pointer group relative rounded px-1 ${chartSymbol === t.id ? 'bg-red-600/10 outline outline-1 outline-red-600/40' : ''}`}
              >
                <span className="text-gray-500 hover:text-black transition-colors">{t.symbol}</span>
                <span className="text-xl font-bold">{t.price}</span>
                <span className={t.up ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                  {t.change}
                </span>
                
                {/* Mini sparkline tooltip — lịch sử giá thật từ các lần poll */}
                {t.history.length >= 2 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#111] p-2 pointer-events-none w-[80px] h-[40px] z-10 border border-white/20">
                  <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke={t.up ? '#26a69a' : '#ef5350'}
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-16 bg-[#111111] p-6 border border-[#111111] shadow-none">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 text-white font-mono tabular-nums">
            <div>
              <h2 className="text-2xl font-bold">{chartLabel} <span className="text-sm font-normal text-gray-400">POLL 12S</span></h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs items-center">
              {CHART_SYMBOLS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setChartSymbol(s.id)}
                  className={`px-3 py-1 ${chartSymbol === s.id ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {s.label.split('/')[0]}
                </button>
              ))}
              <span className="w-px h-4 bg-white/20 mx-1" />
              {CHART_INTERVALS.map((iv) => (
                <button
                  key={iv.id}
                  onClick={() => setChartInterval(iv.id)}
                  className={`px-3 py-1 ${chartInterval === iv.id ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>

          <TradingChart symbol={chartSymbol} interval={chartInterval} />
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
                <div className="border border-[#111111]/10 h-full hover:bg-white transition-colors shadow-none overflow-hidden bg-white/60">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={article?.thumbnail?.url}
                      alt={article?.thumbnail?.alt || article?.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                  <span className="font-mono text-[10px] text-red-600 uppercase font-semibold">Tài Chính</span>
                  <h4 className="font-serif text-2xl font-bold mt-4 mb-3 group-hover:underline decoration-1 underline-offset-4 line-clamp-3">
                    {article?.title}
                  </h4>
                  <p className="font-sans text-sm text-gray-600 line-clamp-3">
                    {article?.excerpt}
                  </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
