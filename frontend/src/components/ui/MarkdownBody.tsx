'use client';

import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const DEFAULT_FALLBACK = '/images/placeholders/fallback.svg';

function MarkdownInlineImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const initialSrc = typeof src === 'string' && src.trim() ? src.trim() : DEFAULT_FALLBACK;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const nextSrc = typeof src === 'string' && src.trim() ? src.trim() : DEFAULT_FALLBACK;
    setImgSrc(nextSrc);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return (
    <figure className="my-8 overflow-hidden rounded-xl bg-gray-100 border border-gray-200/60 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
      <div className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-neutral-900 flex items-center justify-center">
        {isLoading && !hasError && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse"
          />
        )}
        <img
          {...props}
          src={imgSrc}
          alt={alt || 'Minh họa bài viết'}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (imgSrc !== DEFAULT_FALLBACK) {
              setImgSrc(DEFAULT_FALLBACK);
            } else {
              setHasError(true);
            }
            setIsLoading(false);
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
      {alt && alt.trim() && (
        <figcaption className="px-4 py-2.5 text-center font-sans text-xs italic text-gray-500 bg-gray-50/80 dark:bg-neutral-950/80 dark:text-neutral-400 border-t border-gray-100 dark:border-neutral-800">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export default function MarkdownBody({ content }: { content: string }) {
  const normalizedContent = useMemo(() => {
    if (!content) return '';
    return content.replace(/\bclassName\s*=/g, 'class=');
  }, [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target={props.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" />
        ),
        img: ({ node, src, alt, ...props }) => (
          <MarkdownInlineImage src={src} alt={alt} {...props} />
        ),
      }}
    >
      {normalizedContent}
    </ReactMarkdown>
  );
}
