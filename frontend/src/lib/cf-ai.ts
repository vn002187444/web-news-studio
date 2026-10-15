/**
 * Cloudflare Workers AI Helper with Quota Guard
 *
 * Tận dụng Cloudflare Workers AI trên Free Tier (giới hạn 10,000 Neurons/ngày).
 * Tích hợp cơ chế Quota Guard để đảm bảo không vượt quá hạn ngạch:
 * - Ưu tiên các model siêu nhẹ như @cf/meta/llama-3.2-1b-instruct (~50-80 neurons/call).
 * - Tự động ngắt khi chạm ngưỡng an toàn 7,500 Neurons/ngày và chuyển sang Heuristic.
 */

export interface CfAiAnalysis {
  shouldProcess: boolean;
  score: number;
  tags: string[];
  neuronsEstimated: number;
  usedAi: boolean;
}

export interface NewsAnalysisResult {
  isWorthy: boolean;
  score: number;
  category: string;
  keyFacts: string[];
  angle: string;
}

export interface WorkerEnv {
  AI?: any; // Cloudflare Workers AI binding
  CACHE_KV?: any; // Cloudflare KV binding để lưu lượng neuron tiêu thụ
}

const DAILY_NEURON_HARD_LIMIT = 7500; // Ngưỡng an toàn bảo vệ 10,000 Neurons miễn phí
const ESTIMATED_NEURONS_PER_CALL = 70; // Ước tính số neuron cho 1 lượt prompt ngắn 1B model

/**
 * Phân tích & tiền thẩm định tin tức trên Cloudflare Worker với Quota Guard
 */
export async function preFilterWithWorkersAi(
  title: string,
  snippet: string,
  env?: WorkerEnv
): Promise<CfAiAnalysis> {
  const dateKey = new Date().toISOString().slice(0, 10);
  const quotaKey = `cf_ai_neurons_${dateKey}`;

  let currentNeurons = 0;
  if (env?.CACHE_KV) {
    try {
      const stored = await env.CACHE_KV.get(quotaKey);
      currentNeurons = stored ? parseInt(stored, 10) : 0;
    } catch {}
  }

  // 1. Kiểm tra Quota Guard: Nếu gần chạm ngưỡng miễn phí hàng ngày -> Ngắt ngay lập tức
  if (currentNeurons + ESTIMATED_NEURONS_PER_CALL > DAILY_NEURON_HARD_LIMIT || !env?.AI) {
    console.log(`🛡️ [Quota Guard] Neurons hôm nay: ${currentNeurons}/${DAILY_NEURON_HARD_LIMIT}. Sử dụng Heuristic lọc tin.`);
    return runFastHeuristicFilter(title, snippet);
  }

  try {
    // 2. Chạy model 1B siêu nhẹ để tiết kiệm tối đa Neurons
    const response = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are an ultra-fast news filter. Return ONLY JSON: {"pass": boolean, "score": number, "tags": string[]}. Pass if score >= 7.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nSnippet: ${snippet.slice(0, 200)}`,
        },
      ],
      max_tokens: 60, // Giới hạn token tối đa để không tốn neurons
    });

    // 3. Cập nhật số neuron tiêu thụ vào KV
    if (env?.CACHE_KV) {
      await env.CACHE_KV.put(quotaKey, String(currentNeurons + ESTIMATED_NEURONS_PER_CALL), {
        expirationTtl: 86400 * 2, // Hết hạn sau 48h
      });
    }

    const text = response?.response || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    return {
      shouldProcess: Boolean(parsed.pass ?? true),
      score: Number(parsed.score ?? 7.0),
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      neuronsEstimated: ESTIMATED_NEURONS_PER_CALL,
      usedAi: true,
    };
  } catch (err) {
    console.warn('⚠️ [Workers AI] Lỗi gọi AI hoặc parse JSON, chuyển sang heuristic:', err);
    return runFastHeuristicFilter(title, snippet);
  }
}

/**
 * Bộ lọc nhanh Heuristic (0 Neurons, 0 chi phí, thời gian xử lý < 1ms)
 */
function runFastHeuristicFilter(title: string, snippet: string): CfAiAnalysis {
  const text = (title + ' ' + snippet).toLowerCase();
  const spamKeywords = ['khuyến mãi', 'giảm giá', 'voucher', 'mua sắm ngay', 'tặng kèm', 'quảng cáo'];
  const hasSpam = spamKeywords.some((k) => text.includes(k));

  return {
    shouldProcess: !hasSpam && title.length > 20,
    score: hasSpam ? 3.0 : 8.0,
    tags: ['news', 'curated'],
    neuronsEstimated: 0,
    usedAi: false,
  };
}

/**
 * Phân tích chuyên sâu tin tức thay thế Jev bằng Cloudflare Workers AI
 * Hỗ trợ 2 môi trường:
 * 1. Cloudflare Worker Edge (env.AI binding)
 * 2. Node.js / GitHub Actions (Cloudflare REST API qua CF_ACCOUNT_ID và CF_API_TOKEN)
 * 3. Fallback Heuristic tự động an toàn khi chưa cấu hình token hoặc chạm quota
 */
export async function analyzeNewsWithWorkersAi(
  title: string,
  snippet: string,
  category: string,
  env?: WorkerEnv
): Promise<NewsAnalysisResult> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  // Fallback heuristic function
  const fallback = (): NewsAnalysisResult => {
    const isSpam = /quảng cáo|khuyến mãi|mua ngay|liên hệ|sale|voucher/i.test(title + ' ' + snippet);
    return {
      isWorthy: !isSpam && title.length > 15,
      score: isSpam ? 3.0 : 7.5,
      category,
      keyFacts: [title],
      angle: 'Phân tích tổng quan và tác động thực tế',
    };
  };

  const promptMessages = [
    {
      role: 'system',
      content: 'You are a rigorous news analyzer. Analyze the provided news and extract facts. Return ONLY a valid JSON object: {"isWorthy": boolean, "score": number, "category": string, "keyFacts": string[], "angle": string}. isWorthy is true if score >= 7.0 and not spam/ad.',
    },
    {
      role: 'user',
      content: `Title: ${title}\nSnippet: ${snippet.slice(0, 300)}\nSuggested Category: ${category}`,
    },
  ];

  try {
    let responseText = '';

    if (env?.AI) {
      // 1. Chạy trong môi trường Cloudflare Worker (Edge Runtime)
      const dateKey = new Date().toISOString().slice(0, 10);
      const quotaKey = `cf_ai_neurons_${dateKey}`;
      let currentNeurons = 0;
      if (env.CACHE_KV) {
        try {
          const stored = await env.CACHE_KV.get(quotaKey);
          currentNeurons = stored ? parseInt(stored, 10) : 0;
        } catch {}
      }

      if (currentNeurons + ESTIMATED_NEURONS_PER_CALL > DAILY_NEURON_HARD_LIMIT) {
        console.log(`🛡️ [Quota Guard] Neurons hôm nay: ${currentNeurons}/${DAILY_NEURON_HARD_LIMIT}. Sử dụng Heuristic fallback.`);
        return fallback();
      }

      const aiRes = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
        messages: promptMessages,
        max_tokens: 150,
      });
      responseText = aiRes?.response || '{}';

      if (env.CACHE_KV) {
        await env.CACHE_KV.put(quotaKey, String(currentNeurons + ESTIMATED_NEURONS_PER_CALL), {
          expirationTtl: 86400 * 2,
        });
      }
    } else if (accountId && apiToken) {
      // 2. Chạy trong môi trường Node.js / GitHub Actions qua Cloudflare REST API
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-1b-instruct`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messages: promptMessages,
          max_tokens: 150,
        }),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Workers AI] REST API Error ${res.status}. Fallback heuristic.`);
        return fallback();
      }

      const data: any = await res.json();
      responseText = data.result?.response || '{}';
    } else {
      console.log('ℹ️ [Workers AI] Chưa cấu hình CF_ACCOUNT_ID/CF_API_TOKEN. Sử dụng fallback heuristic.');
      return fallback();
    }

    const cleanedText = responseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      isWorthy: Boolean(parsed.isWorthy ?? true),
      score: Number(parsed.score ?? 7.5),
      category: String(parsed.category || category),
      keyFacts: Array.isArray(parsed.keyFacts) && parsed.keyFacts.length > 0 ? parsed.keyFacts : [title],
      angle: String(parsed.angle || 'Phân tích tổng quan và tác động thực tế'),
    };
  } catch (e) {
    console.warn('⚠️ [Workers AI] Lỗi phân tích AI, chuyển sang fallback heuristic:', e);
    return fallback();
  }
}
