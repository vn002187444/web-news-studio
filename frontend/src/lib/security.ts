// So sánh chuỗi an toàn, chống timing-attack. Edge-compatible (không dùng node:crypto).
export function secureCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Chỉ cho phép redirect nội bộ: bắt đầu bằng / nhưng không phải // (protocol-relative).
export function safeRedirectPath(input: string | null, fallback = '/vi'): string {
  if (!input) return fallback;
  if (!input.startsWith('/')) return fallback;
  if (input.startsWith('//')) return fallback;
  return input;
}
