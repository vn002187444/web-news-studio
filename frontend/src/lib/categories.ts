export const CATEGORY_NAMES: Record<string, string> = {
  tech: 'Công Nghệ',
  blockchain: 'Blockchain',
  game: 'Game & Esports',
  finance: 'Tài Chính',
  lifestyle: 'Lifestyle',
  sports: 'Thể Thao',
  entertainment: 'Giải Trí',
  education: 'Giáo Dục',
  science: 'Khoa Học',
  world: 'Thế Giới'
};

export function getCategoryName(slug: string): string {
  return CATEGORY_NAMES[slug] || slug;
}
