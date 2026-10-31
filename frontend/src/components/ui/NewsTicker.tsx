'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

interface TickerArticle {
  title: string;
  slug: string;
  category: string;
}

function TickerItem({ article }: { article: TickerArticle }) {
  const inner = (
    <>
      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" aria-hidden="true" />
      <span className="font-mono text-xs uppercase tracking-widest group-hover:text-red-600 group-hover:underline underline-offset-4 transition-colors">
        {article.title}
      </span>
    </>
  );
  const cls =
    'flex items-center gap-4 mx-4 group whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded';
  // Có slug thật → link tới bài viết; fallback → link tới category
  if (article.slug) {
    return (
      <Link href={`/${article.category}/${article.slug}`} className={cls} data-cursor="READ">
        {inner}
      </Link>
    );
  }
  return (
    <Link href={`/${article.category}`} className={cls} data-cursor="READ">
      {inner}
    </Link>
  );
}

export default function NewsTicker({ articles }: { articles?: TickerArticle[] }) {
  if (!articles || articles.length === 0) return null;
  const news = articles.slice(0, 10);

  return (
    <div
      className="w-full border-y border-[#111111]/10 py-3 overflow-hidden bg-[#F4F4F0] flex items-center group/ticker"
      role="marquee"
      aria-label="Tin nóng"
    >
      <motion.div
        className="flex whitespace-nowrap w-max group-hover/ticker:[animation-play-state:paused] will-change-transform"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration: 90 }}
      >
        {/* Duplicate mảng để loop liền mạch — mỗi nửa đều bấm được */}
        {[...news, ...news].map((a, i) => (
          <TickerItem key={`${a.slug || a.title}-${i}`} article={a} />
        ))}
      </motion.div>
    </div>
  );
}
