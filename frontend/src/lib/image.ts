export {
  resolveSmartThumbnail,
  isValidThumbnailUrl,
  generateCoverSvgDataUri,
  CURATED_THUMBNAIL_POOL,
} from './image-processor';

const BROKEN_THUMB_REPLACEMENTS: Record<string, string> = {
  '1622979135225-d2ba269bc1df': 'https://images.unsplash.com/photo-1621504450181-5d356f61d307',
  '1508098682722-e99c43a406b2': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
  '1517649763962-0c623266ddc0': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd',
  '1523050854058-8df90110c9f1': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
  '1477959858617-67f30bc75b82': 'https://images.unsplash.com/photo-1444723121867-7a241cacace9',
};

export function optimizeThumbnail(url: string | undefined | null, w = 1200, q = 65): string {
  if (!url || !url.trim()) return '/images/placeholders/fallback.svg';

  let cleanUrl = url.trim();

  // Tự động thay thế nếu gặp các ID ảnh Unsplash đã bị gỡ bỏ
  for (const [brokenId, replacement] of Object.entries(BROKEN_THUMB_REPLACEMENTS)) {
    if (cleanUrl.includes(brokenId)) {
      cleanUrl = replacement;
      break;
    }
  }

  // Tránh double-encode Cloudinary/Sanity
  if (cleanUrl.includes('cloudinary.com') || cleanUrl.includes('sanity.io')) {
    return cleanUrl;
  }

  // Nếu là ảnh nội bộ, dùng Next.js Image Optimization API thủ công
  if (cleanUrl.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(cleanUrl)}&w=${w}&q=${q}`;
  }

  // Tối ưu ảnh Unsplash tại nguồn (auto WebP/AVIF, responsive width)
  if (cleanUrl.includes('unsplash.com')) {
    try {
      const u = new URL(cleanUrl);
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch {
      return cleanUrl;
    }
  }

  return cleanUrl;
}
