'use client';

import { useState, useEffect, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';
import { CURATED_THUMBNAIL_POOL } from '@/lib/image-processor';

const DEFAULT_FALLBACK = '/images/placeholders/fallback.svg';

export interface AdaptiveImageProps extends Omit<ImageProps, 'src'> {
  src?: string | { url?: string; src?: string } | null;
  category?: string;
  fallbackSrc?: string;
}

function extractValidSrc(src: string | { url?: string; src?: string } | null | undefined): string {
  if (!src) return '';
  if (typeof src === 'string') {
    const s = src.trim();
    if (s.startsWith('javascript:') || s.startsWith('vbscript:') || s.startsWith('data:text/html')) {
      return '';
    }
    if (s.length > 0 && s !== 'undefined' && s !== 'null' && s !== '[object Object]') {
      return s;
    }
    return '';
  }
  if (typeof src === 'object') {
    if (typeof src.url === 'string') return extractValidSrc(src.url);
    if (typeof src.src === 'string') return extractValidSrc(src.src);
  }
  return '';
}

function resolveCategoryCuratedPhoto(category?: string, seed = ''): string {
  if (!category) return '';
  const cat = category.toLowerCase().trim();
  const pool = CURATED_THUMBNAIL_POOL[cat] || CURATED_THUMBNAIL_POOL.tech;
  if (!pool || pool.length === 0) return '';
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  const base = pool[index];
  return `${base}?auto=format&fit=crop&w=1200&q=75`;
}

export default function AdaptiveImage({
  src,
  alt = 'News Studio Image',
  category,
  fallbackSrc,
  className = '',
  onError,
  onLoad,
  ...props
}: AdaptiveImageProps) {
  const altText = typeof alt === 'string' ? alt : 'news';
  
  const categoryFallback = useMemo(() => {
    return resolveCategoryCuratedPhoto(category, altText);
  }, [category, altText]);

  const targetFallback = fallbackSrc || categoryFallback || DEFAULT_FALLBACK;

  const initialSrc = useMemo(() => {
    const raw = extractValidSrc(src);
    return raw || targetFallback;
  }, [src, targetFallback]);

  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStage, setErrorStage] = useState<number>(0);

  useEffect(() => {
    const raw = extractValidSrc(src);
    setCurrentSrc(raw || targetFallback);
    setIsLoading(true);
    setErrorStage(0);
  }, [src, targetFallback]);

  const handleLoadingComplete = (e: any) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: any) => {
    if (errorStage === 0) {
      if (targetFallback && targetFallback !== currentSrc) {
        setCurrentSrc(targetFallback);
        setErrorStage(1);
      } else {
        setCurrentSrc(DEFAULT_FALLBACK);
        setErrorStage(2);
      }
    } else if (errorStage === 1) {
      if (currentSrc !== DEFAULT_FALLBACK) {
        setCurrentSrc(DEFAULT_FALLBACK);
        setErrorStage(2);
      }
    }
    setIsLoading(false);
    if (onError) onError(e);
  };

  const combinedImageClass = `object-cover transition-opacity duration-500 ease-out ${
    isLoading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
  } ${className}`;

  return (
    <>
      {isLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 overflow-hidden bg-gray-200/80 dark:bg-neutral-800 pointer-events-none"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
        </div>
      )}

      <Image
        {...props}
        src={currentSrc}
        alt={altText}
        className={combinedImageClass}
        onLoad={handleLoadingComplete}
        onError={handleError}
      />
    </>
  );
}
