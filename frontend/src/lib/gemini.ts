// Helper gọi Gemini an toàn trên Workers Free:
// - Timeout SDK + Promise.race (tránh treo invocation khi API chậm)
// - Cache 2 lớp: in-memory (per-isolate) + Cache API (edge) cho kết quả thành công
// - Lỗi/timeout: caller tự graceful degradation, không throw.

export const GEMINI_TIMEOUT_MS = 25_000; // SDK abort sau 25s
export const GEMINI_RACE_MS = 28_000; // lưới an toàn ngoài cùng
export const GEMINI_CACHE_TTL_S = 6 * 3600; // cache bài AI 6h

export function aiCacheKey(parts: string[]): string {
  const s = parts.join('|');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

const mem = new Map<string, { exp: number; value: unknown }>();
const MEM_MAX = 100;

function memGet<T>(key: string): T | null {
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    mem.delete(key);
    return null;
  }
  return hit.value as T;
}

function memSet(key: string, value: unknown, ttlMs: number): void {
  if (mem.size >= MEM_MAX) {
    const oldest = mem.keys().next().value;
    if (oldest) mem.delete(oldest);
  }
  mem.set(key, { exp: Date.now() + ttlMs, value });
}

function edgeCache(): Cache | null {
  try {
    if (typeof caches !== 'undefined') {
      const withDefault = caches as unknown as { default?: Cache };
      if (withDefault.default) return withDefault.default;
    }
  } catch { /* non-Workers runtime */ }
  return null;
}

function cacheRequest(key: string): Request | null {
  try {
    return new Request(`https://ai-cache.internal/gemini/${key}`);
  } catch {
    return null;
  }
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout sau ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, guard]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Đọc cache 2 lớp, miss → gọi loader() rồi ghi cả 2 lớp. */
export async function cachedAiJson<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  const memHit = memGet<T>(key);
  if (memHit) return { data: memHit, cached: true };

  const edge = edgeCache();
  const req = edge ? cacheRequest(key) : null;
  if (edge && req) {
    try {
      const hit = await edge.match(req);
      if (hit) {
        const data = (await hit.json()) as T;
        memSet(key, data, Math.min(ttlSeconds * 1000, 30 * 60 * 1000));
        return { data, cached: true };
      }
    } catch { /* cache miss → gọi API */ }
  }

  const data = await loader();
  memSet(key, data, Math.min(ttlSeconds * 1000, 30 * 60 * 1000));
  if (edge && req) {
    try {
      await edge.put(
        req,
        new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${ttlSeconds}`,
          },
        })
      );
    } catch { /* ghi cache best-effort */ }
  }
  return { data, cached: false };
}
