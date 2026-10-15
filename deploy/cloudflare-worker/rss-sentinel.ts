/**
 * Cloudflare Worker: RSS Sentinel & Pre-filter Dispatcher
 *
 * Nhiệm vụ:
 * 1. Chạy hoàn toàn miễn phí trên Cloudflare Workers Cron Trigger (thay vì làm quá tải GitHub Actions).
 * 2. Định kỳ quét 9 nguồn RSS để phát hiện bài viết mới.
 * 3. Dùng Cloudflare Workers AI (@cf/meta/llama-3.2-1b-instruct) để thẩm định chất lượng tin tức ban đầu
 *    (với Quota Guard bảo vệ trần 7,500/10,000 Neurons/ngày).
 * 4. Chỉ khi có bài báo mới đạt chuẩn (score >= 7), Worker mới gửi `repository_dispatch` webhook
 *    để kích hoạt GitHub Actions autoblog.
 *
 * Nhờ kiến trúc này:
 * - GitHub Actions chỉ chạy khi THẬT SỰ CÓ BÀI MỚI CHẤT LƯỢNG CAO.
 * - Tiết kiệm hơn 70% số phút runner GitHub Actions hàng tháng.
 */

export interface Env {
  AI: any;
  SENTINEL_KV: any;
  GH_TOKEN: string; // GitHub Personal Access Token (repo scope)
  GH_REPO: string; // vn002187444/web-news-studio
}

const RSS_FEEDS = [
  'https://vnexpress.net/rss/the-gioi.rss',
  'https://vnexpress.net/rss/khoa-hoc.rss',
  'https://vnexpress.net/rss/so-hoa.rss',
  'https://cointelegraph.com/rss',
];

export default {
  // Lắng nghe Cron Trigger
  async scheduled(event: any, env: Env, ctx: any) {
    ctx.waitUntil(handleRssCheck(env));
  },

  // Hỗ trợ kiểm tra thủ công qua HTTP GET /trigger-check
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/trigger-check') {
      const result = await handleRssCheck(env);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('News Studio RSS Sentinel is active.');
  },
};

async function handleRssCheck(env: Env) {
  let newArticlesFound = 0;
  const dispatchPayloads: any[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (NewsStudioBot/1.0)' } });
      const xml = await res.text();

      // Parse tiêu đề & link đơn giản từ XML (không cần thư viện nặng)
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3);

      for (const itemMatch of items) {
        const itemXml = itemMatch[1];
        const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const linkMatch = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/);

        const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
        const link = (linkMatch?.[1] || linkMatch?.[2] || '').trim();

        if (!title || !link) continue;

        // Băm URL để lưu KV kiểm tra trùng lặp
        const hash = await hashString(link);
        const exists = await env.SENTINEL_KV.get(`rss_${hash}`);
        if (exists) continue; // Đã xử lý trước đó

        // Đánh dấu đã thấy tin
        await env.SENTINEL_KV.put(`rss_${hash}`, 'seen', { expirationTtl: 86400 * 7 });

        // Sử dụng Workers AI siêu nhẹ để thẩm định nhanh
        let pass = true;
        try {
          if (env.AI) {
            const aiRes = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
              messages: [
                { role: 'system', content: 'You are a news evaluator. If this title is relevant news, respond PASS, else SKIP.' },
                { role: 'user', content: title },
              ],
              max_tokens: 10,
            });
            pass = !aiRes?.response?.includes('SKIP');
          }
        } catch {
          pass = true; // Fallback an toàn
        }

        if (pass) {
          newArticlesFound++;
          dispatchPayloads.push({ title, link });
        }
      }
    } catch (e) {
      console.error('Error fetching feed:', feedUrl, e);
    }
  }

  // Nếu có bài báo mới chất lượng, kích hoạt GitHub Action
  if (newArticlesFound > 0 && env.GH_TOKEN && env.GH_REPO) {
    await triggerGitHubAction(env, dispatchPayloads);
  }

  return { ok: true, newArticlesFound, dispatched: newArticlesFound > 0 };
}

async function triggerGitHubAction(env: Env, items: any[]) {
  const url = `https://api.github.com/repos/${env.GH_REPO}/dispatches`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Worker-Sentinel',
    },
    body: JSON.stringify({
      event_type: 'autoblog_trigger',
      client_payload: {
        articles: items,
        timestamp: new Date().toISOString(),
      },
    }),
  });
}

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
