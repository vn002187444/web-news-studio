/**
 * OpenCode API Client & Two-Stage Analysis Pipeline
 *
 * Tích hợp OpenCode API (https://opencode.ai/inference) sử dụng chuẩn OpenAI-compatible.
 * Hỗ trợ Model Jev (Decision & Evaluation Model) để phân tích, thẩm định và trích xuất cấu trúc
 * trước khi chuyển sang Gemini viết bài chi tiết.
 */

export interface ContentAnalysisResult {
  isWorthy: boolean; // Có nên đăng bài không (điểm ≥ 7.0)
  score: number; // Thang điểm 0 - 10
  category: string; // Chuyên mục chuẩn xác
  confidence: number; // Độ tin cậy (0.0 - 1.0)
  keyEntities: string[]; // Các thực thể quan trọng (người, công ty, đồng tiền, sự kiện)
  keyFacts: string[]; // 3-5 dữ kiện cốt lõi không được sai lệch
  angle: string; // Góc tiếp cận đề xuất cho bài viết
  suggestedInternalLinks: string[]; // Slug các bài viết có sẵn để liên kết
}

export interface OpenCodeConfig {
  apiKey?: string;
  baseUrl?: string;
  modelJev?: string;
}

const DEFAULT_BASE_URL = 'https://opencode.ai/inference/v1';
const DEFAULT_JEV_MODEL = 'opencode/jev-1.13';

/**
 * Giai đoạn 1: Phân tích và thẩm định bài viết bằng Model Jev qua OpenCode API
 */
export async function analyzeContentWithJev(
  title: string,
  rawSnippet: string,
  candidateCategory: string,
  existingSlugs: string[] = [],
  config?: OpenCodeConfig
): Promise<ContentAnalysisResult> {
  const apiKey = config?.apiKey || process.env.OPENCODE_API_KEY;
  const baseUrl = config?.baseUrl || process.env.OPENCODE_BASE_URL || DEFAULT_BASE_URL;
  const model = config?.modelJev || process.env.OPENCODE_JEV_MODEL || DEFAULT_JEV_MODEL;

  // Nếu chưa cấu hình OPENCODE_API_KEY, kích hoạt Fallback Heuristic / Rule-based
  // để đảm bảo hệ thống vẫn vận hành trơn tru mà không bị lỗi.
  if (!apiKey) {
    console.log('ℹ️ [OpenCode] OPENCODE_API_KEY chưa cấu hình. Kích hoạt fallback phân tích heuristic.');
    return fallbackHeuristicAnalysis(title, rawSnippet, candidateCategory, existingSlugs);
  }

  const prompt = `
Bạn là Model Jev - chuyên gia thẩm định tin tức và trích xuất dữ liệu có cấu trúc.
Hãy phân tích thông tin đầu vào sau và trả về JSON thuần:

Tiêu đề: ${title}
Nội dung tóm tắt: ${rawSnippet}
Chuyên mục gợi ý: ${candidateCategory}
Danh sách các bài viết hiện có trên hệ thống: ${existingSlugs.slice(0, 10).join(', ')}

YÊU CẦU ĐÁNH GIÁ:
1. Đánh giá độ mới, tính xác thực và giá trị thông tin đối với độc giả (thang điểm 1.0 - 10.0).
2. Quyết định có nên xuất bản không (isWorthy: true nếu score >= 7.0 và không phải bài quảng cáo/rác).
3. Chuẩn hóa chuyên mục thành 1 trong các giá trị: world, tech, blockchain, game, finance, lifestyle, sports, entertainment, education, science.
4. Trích xuất 3-5 sự thật cốt lõi (keyFacts) từ bài viết gốc để tránh việc AI viết bài sau này bịa đặt số liệu.
5. Chọn 1-2 slug từ danh sách có sẵn phù hợp nhất để làm liên kết nội bộ.

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC (JSON thuần, không kèm markdown):
{
  "isWorthy": true,
  "score": 8.5,
  "category": "${candidateCategory}",
  "confidence": 0.95,
  "keyEntities": ["Entity1", "Entity2"],
  "keyFacts": ["Fact 1", "Fact 2"],
  "angle": "Phân tích tác động...",
  "suggestedInternalLinks": []
}
`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are Jev, a rigorous decision & structured analysis engine.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1, // Thấp để đảm bảo tính tất định và chính xác
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn(`⚠️ [OpenCode] API trả lỗi ${response.status}. Sử dụng phân tích fallback.`);
      return fallbackHeuristicAnalysis(title, rawSnippet, candidateCategory, existingSlugs);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      isWorthy: Boolean(parsed.isWorthy ?? true),
      score: Number(parsed.score ?? 7.5),
      category: String(parsed.category || candidateCategory).toLowerCase(),
      confidence: Number(parsed.confidence ?? 0.8),
      keyEntities: Array.isArray(parsed.keyEntities) ? parsed.keyEntities : [],
      keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts : [],
      angle: String(parsed.angle || 'Phân tích tổng hợp sự kiện'),
      suggestedInternalLinks: Array.isArray(parsed.suggestedInternalLinks) ? parsed.suggestedInternalLinks : [],
    };
  } catch (error) {
    console.error('❌ [OpenCode] Lỗi kết nối OpenCode API:', error);
    return fallbackHeuristicAnalysis(title, rawSnippet, candidateCategory, existingSlugs);
  }
}

/**
 * Phân tích dự phòng bằng Heuristic (không tốn chi phí và không phụ thuộc API ngoài)
 */
function fallbackHeuristicAnalysis(
  title: string,
  rawSnippet: string,
  candidateCategory: string,
  existingSlugs: string[]
): ContentAnalysisResult {
  const isSpam = /quảng cáo|khuyến mãi|mua ngay|liên hệ hotline|sale/i.test(title + rawSnippet);
  const wordCount = (rawSnippet || '').split(/\s+/).length;
  const isTooShort = wordCount < 15;

  const score = isSpam || isTooShort ? 4.0 : 8.0;

  return {
    isWorthy: score >= 7.0,
    score,
    category: candidateCategory,
    confidence: 0.85,
    keyEntities: [],
    keyFacts: [title],
    angle: 'Phân tích bối cảnh và diễn biến chính của sự kiện',
    suggestedInternalLinks: existingSlugs.slice(0, 2),
  };
}
