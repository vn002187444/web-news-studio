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

  return url;
}
