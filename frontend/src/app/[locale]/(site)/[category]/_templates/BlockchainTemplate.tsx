'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';

// Quả cầu 3D chỉ tải khi browser (không SSR) → three.js không vào bundle trang.
const BlockchainSphere = dynamic(() => import('./BlockchainSphere'), {
  ssr: false,
  loading: () => <div className="hidden md:block w-[300px] h-[300px] rounded-full border border-green-500/20 animate-pulse" />,
});

// Particle Burst Logic for CTA buttons
function ParticleBurst({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Reduced motion check
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return null;

  const particles = Array.from({ length: 12 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" style={{ left: x, top: y }}>
      {particles.map((_, i) => {
        const angle = (i * 360) / particles.length;
        const velocity = 50 + Math.random() * 50;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * velocity,
              y: Math.sin((angle * Math.PI) / 180) * velocity,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"
          />
        );
      })}
    </div>
  );
}

// 3D Wireframe Sphere Component — xem ./BlockchainSphere (dynamic, ssr:false)

// Sparkline mini — vẽ đường giá lịch sử trong widget
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return null;
  const w = 120, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} aria-hidden="true" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? '#4ade80' : '#f87171'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// Ticker crypto giá THẬT — Binance 24hr ticker, poll 15s, dừng khi tab ẩn.
// Lịch sử sparkline tích lũy từ các lần poll (không bịa sẵn, không random-walk).
const TICK_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
type Tick = { sym: string; price: number; chg: number; hist: number[] };
function CryptoTicker() {
  const [ticks, setTicks] = useState<Tick[]>([]);
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(TICK_SYMBOLS))}`,
          { cache: 'no-store' }
        );
        if (!r.ok || stop) return;
        const arr = await r.json();
        if (stop || !Array.isArray(arr)) return;
        setTicks((prev) => {
          const prevMap = new Map(prev.map(p => [p.sym, p]));
          return arr.map((d: any) => {
            const price = Number(d.lastPrice);
            const chg = Number(d.priceChangePercent);
            const sym = String(d.symbol).replace('USDT', '');
            const old = prevMap.get(sym);
            return {
              sym,
              price: Number.isFinite(price) ? price : (old?.price ?? 0),
              chg: Number.isFinite(chg) ? chg : (old?.chg ?? 0),
              hist: Number.isFinite(price) ? [...(old?.hist ?? []).slice(-9), price] : (old?.hist ?? []),
            };
          });
        });
      } catch { /* giữ giá cũ khi Binance chặn */ }
    };
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, 15000);
    return () => { stop = true; clearInterval(id); };
  }, []);
  if (ticks.length === 0) {
    return <div className="mb-12 border border-green-400/20 rounded-full px-4 py-3 font-mono text-xs text-white/40 animate-pulse" aria-label="Loading crypto prices">Đang tải giá crypto trực tiếp…</div>;
  }
  const row = [...ticks, ...ticks];
  return (
    <div className="mb-12 border border-green-400/20 rounded-full px-2 py-2 overflow-hidden bg-white/[0.02] shadow-[0_0_30px_rgba(0,255,150,0.08)]" aria-label="Crypto prices live">
      <motion.div className="flex gap-8 whitespace-nowrap w-max" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, ease: 'linear', duration: 25 }}>
        {row.map((t, i) => {
          const up = t.chg >= 0;
          return (
            <span key={i} className="flex items-center gap-3 font-mono text-xs">
              <b className="text-white">{t.sym}</b>
              <span className="text-white/80 tabular-nums">${t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={up ? 'text-green-400' : 'text-red-400'}>{up ? '▲' : '▼'} {t.chg.toFixed(2)}%</span>
              <Sparkline data={t.hist} up={up} />
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

const TiltCard = ({ article }: { article: any }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    // Glare lướt theo chuột
    e.currentTarget.style.setProperty('--glx', `${(mouseX / width) * 100}%`);
    e.currentTarget.style.setProperty('--gly', `${(mouseY / height) * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[500px] rounded-3xl bg-black border border-white/10 p-6 flex flex-col justify-end overflow-hidden group cursor-pointer shadow-[0_0_50px_rgba(0,255,100,0.05)] hover:shadow-[0_0_80px_rgba(0,255,100,0.15)] transition-shadow duration-500"
    >
      {/* 3D Inner Content */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        style={{ 
          backgroundImage: `url(${article.thumbnail.url})`, 
          transform: "translateZ(20px) scale(1.1)" 
        }}
      />
      
      {/* Bloom Lighting Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10" />
      {/* Glare lướt bề mặt khi nghiêng */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(circle at var(--glx,50%) var(--gly,50%), rgba(255,255,255,0.22), transparent 55%)' }}
      />

      <div style={{ transform: "translateZ(80px)" }} className="relative z-20">
        <span className="font-mono text-xs text-green-400 border border-green-400/50 px-3 py-1 rounded-full mb-4 inline-block shadow-[0_0_15px_rgba(0,255,100,0.5)]">
          {article.tags?.[0] || 'DeFi'}
        </span>
        <h3 className="font-serif text-3xl font-bold uppercase leading-tight mb-2 text-white">
          {article.title}
        </h3>
        <p className="font-mono text-xs text-white/50 max-w-sm mb-4">
          {article.excerpt}
        </p>
      </div>
    </motion.div>
  );
};

export default function BlockchainTemplate({ articles }: { articles: any[] }) {
  // Use real AI data — không duplicate hack, hiện empty-state khi thiếu
  const cryptoArticles = articles && articles.length > 0 ? articles : [];
  
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  let burstId = 0;

  const handleCTAClick = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setBursts(prev => [...prev, { id: burstId++, x: clientX, y: clientY }]);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Global Ambient Bloom */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000" />

      <div className="max-w-[1600px] mx-auto relative">
        <div className="flex items-start justify-between gap-8">
          <h1 className="text-6xl md:text-9xl font-sans font-black tracking-tighter uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-700">
            WEB3 <br /> FRONTIER
          </h1>
          {/* Quả cầu wireframe Three.js xoay + Bloom (dynamic ssr:false) */}
          <BlockchainSphere />
        </div>

        <div onClick={handleCTAClick} className="inline-block cursor-pointer">
          <CryptoTicker />
        </div>

        {cryptoArticles.length === 0 && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/40 border border-dashed border-white/20 rounded-2xl p-8 text-center">Chưa có bài Blockchain — chạy autoblog để sinh nội dung.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 perspective-[1000px]">
          {cryptoArticles.slice(0, 6).map((article, i) => (
            <Link key={article.slug || i} href={`/blockchain/${article.slug}`} onClick={handleCTAClick}>
               <TiltCard article={article} />
            </Link>
          ))}
        </div>
      </div>
      {bursts.map(b => (
        <ParticleBurst key={b.id} x={b.x} y={b.y} onComplete={() => setBursts(prev => prev.filter(x => x.id !== b.id))} />
      ))}
    </div>
  );
}
