// Custom image loader — KHÔNG qua `/_next/image`.
//
// Lý do: trên Workers, `/_next/image` chạy bằng Cloudflare Images transformations
// (tính phí theo lượt + TTFB ~2.4s đo được ở LCP + tốn CPU worker vốn chỉ 10ms).
// Ảnh bài viết vốn đã nằm trên CDN tối ưu sẵn (vnecdn/SCMP/Unsplash Imgix/Sanity),
// nên để browser tải trực tiếp từ CDN gốc: song song, edge-cache, tự thương lượng WebP/AVIF.
//
// - Ảnh local (`/...`): trả trực tiếp, không qua optimizer.
// - Unsplash / Sanity: gắn tham số resize + nén + auto format ngay tại nguồn,
//   theo đúng width Next yêu cầu cho từng breakpoint (responsive thật).
// - CDN báo chí khác: giữ nguyên URL gốc (thumbnail RSS vốn đã là cỡ web).
export default function imgLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Ép quality tối đa 65 — đánh đổi đã chọn cho tốc độ tải trang tin tức
  const q = Math.min(quality ?? 65, 65);

  if (src.startsWith('/')) return src;

  try {
    const u = new URL(src);
    const host = u.hostname;

    if (host.includes('unsplash.com')) {
      u.searchParams.set('w', String(Math.min(width, 1600)));
      u.searchParams.set('q', String(q));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    }

    if (host.includes('sanity.io')) {
      u.searchParams.set('w', String(Math.min(width, 1600)));
      u.searchParams.set('q', String(q));
      u.searchParams.set('auto', 'format');
      return u.toString();
    }

    return src;
  } catch {
    return src;
  }
}
