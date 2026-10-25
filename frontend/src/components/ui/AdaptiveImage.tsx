'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_FALLBACK = '/images/placeholders/fallback.svg';

export default function AdaptiveImage({ src, alt, onError, ...props }: ImageProps) {
  const [imgSrc, setImgSrc] = useState<any>(src || DEFAULT_FALLBACK);

  useEffect(() => {
    setImgSrc(src || DEFAULT_FALLBACK);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'News Studio Image'}
      onError={(e) => {
        if (imgSrc !== DEFAULT_FALLBACK) {
          setImgSrc(DEFAULT_FALLBACK);
        }
        if (onError) onError(e);
      }}
    />
  );
}
