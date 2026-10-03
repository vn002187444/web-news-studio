export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Hỗ trợ Portable Text, Markdown hoặc Rich HTML
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  category: 'tech' | 'blockchain' | 'game' | 'finance' | 'lifestyle' | 'sports' | 'entertainment' | 'education' | 'science';
  tags: string[];
  thumbnail: {
    url: string;
    alt: string;
    caption?: string;
  };
  publishedAt: string; // ISO 8601 string
  readingTime: number; // Số phút đọc ước tính
}
