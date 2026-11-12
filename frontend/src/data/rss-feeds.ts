export interface RssFeedConfig {
  name: string;
  url: string;
  category: string;
  country: 'US' | 'CN' | 'JP' | 'KR' | 'RU' | 'UK' | 'GLOBAL' | 'VN';
}

export const RSS_FEEDS: RssFeedConfig[] = [
  // 1. Công Nghệ (tech) - Nguồn Quốc Tế hàng đầu (Mỹ, Anh, Trung)
  { name: 'TechCrunch (Mỹ)', url: 'https://techcrunch.com/feed/', category: 'tech', country: 'US' },
  { name: 'The Verge (Mỹ)', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', country: 'US' },
  { name: 'Ars Technica (Mỹ)', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech', country: 'US' },
  { name: 'Wired (Mỹ)', url: 'https://www.wired.com/feed/rss', category: 'tech', country: 'US' },
  { name: 'SCMP Tech (Trung Quốc)', url: 'https://www.scmp.com/rss/36/feed/', category: 'tech', country: 'CN' },

  // 2. Tài Chính & Kinh Doanh (finance) - Thị trường toàn cầu (Mỹ, Trung)
  { name: 'MarketWatch Top Stories (Mỹ)', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'finance', country: 'US' },
  { name: 'CNBC Finance (Mỹ)', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', category: 'finance', country: 'US' },
  { name: 'SCMP Business (Trung Quốc)', url: 'https://www.scmp.com/rss/92/feed/', category: 'finance', country: 'CN' },

  // 3. Thể Thao (sports) - Thể thao quốc tế & giải đấu lớn (Anh, Mỹ, Trung)
  { name: 'BBC Sport (Anh)', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports', country: 'UK' },
  { name: 'ESPN Top News (Mỹ)', url: 'https://www.espn.com/espn/rss/news', category: 'sports', country: 'US' },
  { name: 'SCMP Sports (Trung Quốc)', url: 'https://www.scmp.com/rss/95/feed/', category: 'sports', country: 'CN' },

  // 4. Game & Esports (game) - Ngành công nghiệp game toàn cầu (Anh, Mỹ)
  { name: 'Eurogamer News (Anh/Mỹ)', url: 'https://www.eurogamer.net/feed/news', category: 'game', country: 'UK' },
  { name: 'PC Gamer (Mỹ)', url: 'https://www.pcgamer.com/rss/', category: 'game', country: 'US' },
  { name: 'IGN Gaming News (Mỹ)', url: 'https://feeds.feedburner.com/ign/news', category: 'game', country: 'US' },

  // 5. Giải Trí (entertainment) - Văn hóa, điện ảnh, âm nhạc quốc tế (Mỹ, Anh, Hàn)
  { name: 'Variety (Mỹ)', url: 'https://variety.com/feed/', category: 'entertainment', country: 'US' },
  { name: 'Deadline Hollywood (Mỹ)', url: 'https://deadline.com/feed/', category: 'entertainment', country: 'US' },
  { name: 'Billboard News (Mỹ)', url: 'https://www.billboard.com/feed/', category: 'entertainment', country: 'US' },
  { name: 'BBC Entertainment & Arts (Anh)', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', category: 'entertainment', country: 'UK' },
  { name: 'Soompi K-Pop & K-Drama (Hàn Quốc)', url: 'https://www.soompi.com/feed', category: 'entertainment', country: 'KR' },

  // 6. Đời Sống (lifestyle) - Phong cách sống & văn hóa quốc tế (Mỹ, Anh, Nhật, Trung)
  { name: 'Lifehacker (Mỹ)', url: 'https://lifehacker.com/feed/rss', category: 'lifestyle', country: 'US' },
  { name: 'The Guardian Lifestyle (Anh)', url: 'https://www.theguardian.com/uk/lifeandstyle/rss', category: 'lifestyle', country: 'UK' },
  { name: 'SCMP Lifestyle (Trung Quốc)', url: 'https://www.scmp.com/rss/94/feed/', category: 'lifestyle', country: 'CN' },
  { name: 'SoraNews24 Culture & Life (Nhật Bản)', url: 'https://soranews24.com/feed/', category: 'lifestyle', country: 'JP' },

  // 7. Giáo Dục (education) - Tri thức, nghiên cứu & giáo dục quốc tế (Anh, Mỹ)
  { name: 'BBC News Education (Anh)', url: 'https://feeds.bbci.co.uk/news/education/rss.xml', category: 'education', country: 'UK' },
  { name: 'The Conversation Education (Mỹ)', url: 'https://theconversation.com/us/education/articles.atom', category: 'education', country: 'US' },
  { name: 'Harvard Gazette Education (Mỹ)', url: 'https://news.harvard.edu/gazette/feed/', category: 'education', country: 'US' },
  { name: 'MIT News (Mỹ)', url: 'https://news.mit.edu/rss/feed', category: 'education', country: 'US' },

  // 8. Khoa Học (science) - Khám phá vũ trụ, phát minh & sinh học (Anh, Mỹ)
  { name: 'BBC Science & Environment (Anh)', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'science', country: 'UK' },
  { name: 'NASA Breaking News (Mỹ)', url: 'https://www.nasa.gov/news-release/feed/', category: 'science', country: 'US' },
  { name: 'ScienceDaily (Mỹ)', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', country: 'US' },
  { name: 'Phys.org Research (Mỹ)', url: 'https://phys.org/rss-feed/', category: 'science', country: 'US' },

  // 9. Blockchain & Tiền Mã Hóa (blockchain) - Web3 & Crypto toàn cầu (Mỹ)
  { name: 'CoinTelegraph (Mỹ)', url: 'https://cointelegraph.com/rss', category: 'blockchain', country: 'US' },
  { name: 'CoinDesk (Mỹ)', url: 'https://www.coindesk.com/arc/outboundfeeds/rss', category: 'blockchain', country: 'US' },
  { name: 'Decrypt (Mỹ)', url: 'https://decrypt.co/feed', category: 'blockchain', country: 'US' },

  // 10. Thế Giới / Thời Sự Quốc Tế (world) - Hãng thông tấn toàn cầu (Anh, Mỹ, Trung, Nhật, Nga, Trung Đông)
  { name: 'BBC World News (Anh)', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', country: 'UK' },
  { name: 'NPR World News (Mỹ)', url: 'https://feeds.npr.org/1004/rss.xml', category: 'world', country: 'US' },
  { name: 'The Guardian World (Anh)', url: 'https://www.theguardian.com/world/rss', category: 'world', country: 'UK' },
  { name: 'Al Jazeera English (Quốc Tế)', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', country: 'GLOBAL' },
  { name: 'The Japan Times News (Nhật Bản)', url: 'https://www.japantimes.co.jp/feed/', category: 'world', country: 'JP' },
  { name: 'SCMP Asia & World (Trung Quốc)', url: 'https://www.scmp.com/rss/4/feed/', category: 'world', country: 'CN' },
  { name: 'The Moscow Times (Nga)', url: 'https://www.themoscowtimes.com/rss/news', category: 'world', country: 'RU' },
  { name: 'Meduza English (Nga)', url: 'https://meduza.io/rss/en/all', category: 'world', country: 'RU' }
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
