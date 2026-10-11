export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://news.minds.io.vn';

export const SITE_NAME = 'News Studio';

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}

export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

export function escapeJsonLd(json: string): string {
  // Ngăn break-out khỏi <script>: </script> / <!-- trong title/content
  return json.replace(/</g, '\\\\u003c').replace(/>/g, '\\\\u003e').replace(/&/g, '\\\\u0026');
}

export function smartTruncate(text: string | null | undefined, maxLength: number = 155): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength);
  const lastPunctuationOrSpace = Math.max(
    sliced.lastIndexOf(' '),
    sliced.lastIndexOf('.'),
    sliced.lastIndexOf(','),
    sliced.lastIndexOf('!'),
    sliced.lastIndexOf('?')
  );

  if (lastPunctuationOrSpace > 0) {
    // Return up to the punctuation/space. If it's punctuation, we might include it or not.
    // The previous implementation was adding ... after punctuation, e.g. "text...."
    // Let's strip trailing punctuation before adding ...
    const base = sliced.slice(0, lastPunctuationOrSpace).trim();
    return base.replace(/[.,!?]+$/, '') + '...';
  }

  return sliced.trim() + '...';
}
