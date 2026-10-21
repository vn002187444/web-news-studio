export interface RssFeedConfig {
  name: string;
  url: string;
  category: string;
  country: 'US' | 'CN' | 'JP' | 'KR' | 'RU' | 'VN' | 'UK';
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // 1. Công Nghệ (tech) - Tối thiểu 4 nguồn (Mỹ, Trung, VN)
  { name: 'TechCrunch (Mỹ)', url: 'https://techcrunch.com/feed/', category: 'tech', country: 'US' },
  { name: 'The Verge (Mỹ)', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', country: 'US' },
  { name: 'SCMP Tech (Trung Quốc)', url: 'https://www.scmp.com/rss/36/feed', category: 'tech', country: 'CN' },
  { name: 'VnExpress Số Hóa (Việt Nam)', url: 'https://vnexpress.net/rss/so-hoa.rss', category: 'tech', country: 'VN' },

  // 2. Tài Chính & Kinh Doanh (finance) - Tối thiểu 3 nguồn (Mỹ, Trung, VN)
  { name: 'MarketWatch Top Stories (Mỹ)', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'finance', country: 'US' },
  { name: 'SCMP Business (Trung Quốc)', url: 'https://www.scmp.com/rss/92/feed', category: 'finance', country: 'CN' },
  { name: 'VnExpress Kinh Doanh (Việt Nam)', url: 'https://vnexpress.net/rss/kinh-doanh.rss', category: 'finance', country: 'VN' },

  // 3. Thể Thao (sports) - Tối thiểu 3 nguồn (Trung, Hàn, VN)
  { name: 'SCMP Sports (Trung Quốc)', url: 'https://www.scmp.com/rss/95/feed', category: 'sports', country: 'CN' },
  { name: 'Yonhap Sports (Hàn Quốc)', url: 'https://en.yna.co.kr/RSS/sports.xml', category: 'sports', country: 'KR' },
  { name: 'VnExpress Thể Thao (Việt Nam)', url: 'https://vnexpress.net/rss/the-thao.rss', category: 'sports', country: 'VN' },

  // 4. Game & Esports (game) - Tối thiểu 3 nguồn (Mỹ, Anh)
  { name: 'Eurogamer News (Anh/Mỹ)', url: 'https://www.eurogamer.net/feed/news', category: 'game', country: 'UK' },
  { name: 'PC Gamer (Mỹ)', url: 'https://www.pcgamer.com/rss/', category: 'game', country: 'US' },
  { name: 'IGN Gaming News (Mỹ)', url: 'https://feeds.feedburner.com/ign/news', category: 'game', country: 'US' },

  // 5. Giải Trí (entertainment) - Tối thiểu 4 nguồn (Mỹ, Hàn, VN)
  { name: 'Variety (Mỹ)', url: 'https://variety.com/feed/', category: 'entertainment', country: 'US' },
  { name: 'Deadline Hollywood (Mỹ)', url: 'https://deadline.com/feed/', category: 'entertainment', country: 'US' },
  { name: 'Soompi K-Pop & K-Drama (Hàn Quốc)', url: 'https://www.soompi.com/feed', category: 'entertainment', country: 'KR' },
  { name: 'VnExpress Giải Trí (Việt Nam)', url: 'https://vnexpress.net/rss/giai-tri.rss', category: 'entertainment', country: 'VN' },

  // 6. Đời Sống (lifestyle) - Tối thiểu 4 nguồn (Mỹ, Trung, Nhật, VN)
  { name: 'Lifehacker (Mỹ)', url: 'https://lifehacker.com/rss', category: 'lifestyle', country: 'US' },
  { name: 'SCMP Lifestyle (Trung Quốc)', url: 'https://www.scmp.com/rss/94/feed', category: 'lifestyle', country: 'CN' },
  { name: 'SoraNews24 Culture & Life (Nhật Bản)', url: 'https://soranews24.com/feed/', category: 'lifestyle', country: 'JP' },
  { name: 'VnExpress Đời Sống (Việt Nam)', url: 'https://vnexpress.net/rss/doi-song.rss', category: 'lifestyle', country: 'VN' },

  // 7. Giáo Dục (education) - Tối thiểu 3 nguồn (Mỹ, VN)
  { name: 'Harvard Gazette Education (Mỹ)', url: 'https://news.harvard.edu/gazette/feed/', category: 'education', country: 'US' },
  { name: 'MIT News (Mỹ)', url: 'https://news.mit.edu/rss/feed', category: 'education', country: 'US' },
  { name: 'VnExpress Giáo Dục (Việt Nam)', url: 'https://vnexpress.net/rss/giao-duc.rss', category: 'education', country: 'VN' },

  // 8. Khoa Học (science) - Tối thiểu 3 nguồn (Mỹ, VN)
  { name: 'ScienceDaily (Mỹ)', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', country: 'US' },
  { name: 'Phys.org Research (Mỹ)', url: 'https://phys.org/rss-feed/', category: 'science', country: 'US' },
  { name: 'VnExpress Khoa Học (Việt Nam)', url: 'https://vnexpress.net/rss/khoa-hoc.rss', category: 'science', country: 'VN' },

  // 9. Blockchain & Tiền Mã Hóa (blockchain) - Tối thiểu 3 nguồn (Mỹ)
  { name: 'CoinTelegraph (Mỹ)', url: 'https://cointelegraph.com/rss', category: 'blockchain', country: 'US' },
  { name: 'CoinDesk (Mỹ)', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'blockchain', country: 'US' },
  { name: 'Decrypt (Mỹ)', url: 'https://decrypt.co/feed', category: 'blockchain', country: 'US' },

  // 10. Thế Giới / Thời Sự Quốc Tế (world) - Tối thiểu 6 nguồn (Nga, Trung, Nhật, Hàn, VN)
  { name: 'The Moscow Times (Nga)', url: 'https://www.themoscowtimes.com/rss/news', category: 'world', country: 'RU' },
  { name: 'Meduza English (Nga)', url: 'https://meduza.io/rss/en/all', category: 'world', country: 'RU' },
  { name: 'SCMP Asia & World (Trung Quốc)', url: 'https://www.scmp.com/rss/4/feed', category: 'world', country: 'CN' },
  { name: 'The Japan Times News (Nhật Bản)', url: 'https://www.japantimes.co.jp/feed/', category: 'world', country: 'JP' },
  { name: 'Yonhap News Top (Hàn Quốc)', url: 'https://en.yna.co.kr/RSS/news.xml', category: 'world', country: 'KR' },
  { name: 'VnExpress Thế Giới (Việt Nam)', url: 'https://vnexpress.net/rss/the-gioi.rss', category: 'world', country: 'VN' }
];

export const ALL_CATEGORIES = [
  'tech',
  'finance',
  'sports',
  'lifestyle',
  'game',
  'entertainment',
  'education',
  'science',
  'blockchain',
  'world'
];

export const CATEGORY_NAMES: Record<string, string> = {
  tech: 'Công Nghệ',
  finance: 'Tài Chính',
  sports: 'Thể Thao',
  lifestyle: 'Đời Sống',
  game: 'Game',
  entertainment: 'Giải Trí',
  education: 'Giáo Dục',
  science: 'Khoa Học',
  blockchain: 'Blockchain',
  world: 'Thế Giới'
};
