'use client';

import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { Link } from '@/i18n/routing';

function YoutubeEmbed({ url, caption }: { url: string; caption?: string }) {
  const id = (url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/) || [])[1] || '';
  if (!id) return null;
  return (
    <figure className="my-10">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={caption || 'Video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {caption && <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption>}
    </figure>
  );
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="font-serif text-3xl font-bold tracking-tight mt-12 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="font-serif text-2xl font-bold tracking-tight mt-10 mb-3">{children}</h3>,
    normal: ({ children }) => <p className="my-5 leading-relaxed text-[1.05rem]">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-4 border-red-600 pl-5 font-serif italic text-xl text-gray-700">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="my-5 list-disc pl-6 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="my-5 list-decimal pl-6 space-y-2">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || '#';
      const internal = href.startsWith('/');
      if (internal) {
        return <Link href={href} className="text-red-600 no-underline hover:underline">{children}</Link>;
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-600 no-underline hover:underline">{children}</a>;
    },
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  types: {
    keyTakeaways: ({ value }: any) => (
      <aside className="my-8 rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h4 className="font-mono text-xs uppercase tracking-widest text-amber-700 mb-3">Những điểm chính</h4>
        <ul className="list-disc pl-5 space-y-2 font-medium">
          {(value?.items || []).map((it: string, i: number) => <li key={i}>{it}</li>)}
        </ul>
      </aside>
    ),
    expertQuote: ({ value }: any) => (
      <figure className="my-8 border-l-4 border-[#111] bg-gray-50 p-6 rounded-r-lg">
        <blockquote className="font-serif italic text-xl leading-relaxed">“{value?.quote}”</blockquote>
        {(value?.author || value?.role) && (
          <figcaption className="mt-3 font-mono text-xs uppercase text-gray-500">
            {value?.author}{value?.role ? ` — ${value.role}` : ''}
          </figcaption>
        )}
      </figure>
    ),
    ctaBanner: ({ value }: any) => (
      <div className="my-8 rounded-lg bg-[#111111] p-8 text-white text-center">
        <h4 className="font-serif text-2xl font-bold mb-2">{value?.title}</h4>
        {value?.description && <p className="text-white/70 mb-5">{value.description}</p>}
        <a href={value?.buttonUrl} className="inline-block bg-red-600 hover:bg-red-500 transition-colors px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest">
          {value?.buttonText || 'Xem thêm'}
        </a>
      </div>
    ),
    chartEmbed: ({ value }: any) => (
      <figure className="my-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">Biểu đồ: {value?.symbol}</div>
        <div className="h-[300px] w-full overflow-hidden rounded bg-gray-50">
          <iframe
            src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(value?.symbol || 'BTCUSD')}&interval=D&theme=light&style=1&locale=vi`}
            title={`Biểu đồ ${value?.symbol}`}
            loading="lazy"
            className="h-full w-full"
          />
        </div>
        {value?.caption && <figcaption className="mt-2 text-sm text-gray-500">{value.caption}</figcaption>}
      </figure>
    ),
    videoEmbed: ({ value }: any) => <YoutubeEmbed url={value?.url} caption={value?.caption} />,
  },
};

export default function PortableArticleBody({ body }: { body: PortableTextBlock[] }) {
  if (!body || body.length === 0) return null;
  return <PortableText value={body} components={components} />;
}
