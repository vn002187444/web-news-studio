export {
  resolveSmartThumbnail,
  isValidThumbnailUrl,
  generateCoverSvgDataUri,
  CURATED_THUMBNAIL_POOL,
} from './image-processor';

export function optimizeThumbnail(url: string | undefined | null, w = 1200, q = 65): string {
  if (!url) return '/images/placeholders/fallback.webp';

  // Tránh double-encode Cloudinary/Sanity
  if (url.includes('cloudinary.com') || url.includes('sanity.io')) {
    return url;
  }

  // Nếu là ảnh nội bộ, dùng Next.js Image Optimization API thủ công
  if (url.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`;
  }

  // Tối ưu ảnh Unsplash tại nguồn (auto WebP/AVIF, responsive width)
  if (url.includes('unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}
