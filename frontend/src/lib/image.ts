// Nén ảnh tại nguồn (source CDN) thay vì dùng dịch vụ resize trả phí:
// - cdn.sanity.io: hỗ trợ transform (?auto=format&fit=max&w=&q=) miễn phí
// - images.unsplash.com: tham số Imgix (?auto=format&fit=crop&w=&q=)
// - Host khác (báo gốc, vnecdn...): giữ nguyên (không can thiệp được).
export function optimizeThumbnail(url: string | undefined | null, w = 1200, q = 65): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname === 'cdn.sanity.io') {
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'max');
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      return u.toString();
    }
    if (u.hostname === 'images.unsplash.com') {
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      return u.toString();
    }
  } catch {
    /* URL tương đối/không hợp lệ → giữ nguyên */
  }
  return url;
}
