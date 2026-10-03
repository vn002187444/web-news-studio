'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TrendingItem {
  slug: string;
  title: string;
  category: string;
  thumbnail: { url: string; alt: string };
  publishedAt: string;
}

export default function TrendingWidget({ articles }: { articles: TrendingItem[] }) {
  const [viewMap, setViewMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/views?top=20').then((r) => r.json()).then((rows: { slug: string; count: number }[]) => {
      const m: Record<string, number> = {};
      rows.forEach((r) => { m[r.slug] = r.count; });
      setViewMap(m);
    }).catch(() => {});
  }, []);

  // Xếp theo views 7 ngày (ở đây là views hiện có) + recency decay, không slice cứng
  const trending = useMemo(() => {
    const list = [...(articles || [])];
    const hasViews = Object.keys(viewMap).length > 0;
    if (!hasViews) return list.slice(0, 5);
    return list
      .map((a) => {
        const ageDays = Math.max(0, (Date.now() - new Date(a.publishedAt).getTime()) / 86400000);
        const score = (viewMap[a.slug] || 0) / (1 + ageDays / 7);
        return { a, score };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 5)
      .map((x) => x.a);
  }, [articles, viewMap]);
  const [hoverImg, setHoverImg] = useState<{ x: number; y: number; url: string } | null>(null);

  if (trending.length === 0) return null;

  return (
    <aside aria-label="Trending" className="lg:sticky lg:top-28 h-fit border-t-2 border-black pt-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />
        Trending Now
      </h3>
      <ol className="flex flex-col">
        {trending.map((a, i) => (
          <li key={a.slug || i} className="group border-b border-black/10 last:border-0">
            <Link
              href={`/${a.category}/${a.slug}`}
              className="flex gap-4 py-4 items-start"
              data-cursor="HOT"
              onMouseMove={(e: React.MouseEvent) => setHoverImg({ x: e.clientX, y: e.clientY, url: a.thumbnail.url })}
              onMouseLeave={() => setHoverImg(null)}
            >
              <span
                aria-hidden="true"
                className="font-serif text-5xl leading-none font-black text-transparent [-webkit-text-stroke:1px_#111] group-hover:[-webkit-text-stroke:1px_#DC2626] transition-colors shrink-0 w-14"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-red-600">{a.category}</span>
                <span className="block font-serif text-lg font-bold leading-tight group-hover:underline underline-offset-4">
                  {a.title}
                </span>
                {viewMap[a.slug] ? (
                  <span className="font-mono text-[10px] text-black/40 tabular-nums">👁 {viewMap[a.slug]} views</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {/* Custom cursor thumbnail bám theo chuột — desktop only */}
      {hoverImg && (
        <motion.div
          aria-hidden="true"
          className="hidden lg:block fixed z-[90] w-40 h-24 pointer-events-none overflow-hidden rounded-lg shadow-2xl"
          style={{ left: 0, top: 0 }}
          animate={{ x: hoverImg.x + 16, y: hoverImg.y + 16 }}
          transition={{ type: 'tween', duration: 0.08 }}
        >
          <Image src={hoverImg.url} alt="" fill className="object-cover" />
        </motion.div>
      )}
    </aside>
  );
}
