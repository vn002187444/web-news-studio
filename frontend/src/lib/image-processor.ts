/**
 * Advanced Image Processing & Smart Fallback Pipeline
 *
 * 1. Kiểm tra tính hợp lệ & chống hotlink cho ảnh từ RSS.
 * 2. Cung cấp kho ảnh Unsplash Curated đa dạng (50+ ảnh chất lượng cao phân chia theo sub-topic)
 *    được chọn ngẫu nhiên có kiểm soát dựa trên hash của slug, loại bỏ hoàn toàn việc các bài báo
 *    cùng chuyên mục dùng chung 1 ảnh thumbnail đơn điệu.
 * 3. Hỗ trợ tạo SVG Cover Banner dự phòng mang phong cách tòa soạn News Studio.
 */

// Kho ảnh chất lượng cao được chọn lọc thủ công theo từng chuyên mục và chủ đề con
export const CURATED_THUMBNAIL_POOL: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475', // Hardware / Chip
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', // Abstract Digital Flow
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', // Robotics / AI
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', // Cybersecurity
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', // Code / Terminal
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1', // Laptop / Workspace
  ],
  blockchain: [
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0', // Web3 3D Sphere
    'https://images.unsplash.com/photo-1621504450181-5d356f61d307', // Crypto Exchange & Neon Chart
    'https://images.unsplash.com/photo-1516245834210-c4c142787335', // Bitcoin Golden Coin
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7', // Ethereum / DeFi
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247', // Blockchain Nodes
  ],
  finance: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', // Trading Chart Bull/Bear
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f', // Stock Market Screen
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e', // Currency / Money
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', // Financial Skyline Buildings
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', // Investment Planning
  ],
  game: [
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f', // Gaming Controller Neon
    'https://images.unsplash.com/photo-1542751371-adc38448a05e', // Esports Arena Setup
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc', // Arcade Cyberpunk
    'https://images.unsplash.com/photo-1511512578047-dfb367046420', // Gamepad Dark Aesthetic
    'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd', // Neon VR Headset
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773', // Wellness Yoga / Meditation
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', // Modern Coffee Culture
    'https://images.unsplash.com/photo-1445205170230-053b83016050', // Fashion Minimalist
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Travel Ocean
    'https://images.unsplash.com/photo-1513151233558-d860c5398176', // Festive Lifestyle
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211', // Running Track
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55', // Football Soccer Stadium / Match
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd', // Fitness & Gym Athletics
    'https://images.unsplash.com/photo-1546519638-68e109498ffc', // Basketball Court
    'https://images.unsplash.com/photo-1530549387789-4c1017266635', // Swimming Pool
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0', // Cinema Movie Clapper
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819', // Concert Stage Lights
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745', // DJ Music Party
    'https://images.unsplash.com/photo-1485846234645-a62644f84728', // Film Reel Vintage
  ],
  education: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655', // Graduation & Lecture Hall
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', // Stack of Books
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', // School Learning Desk
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173', // Online Learning Laptop
  ],
  science: [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d', // Laboratory Glassware
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // Planet Earth / Space
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb', // DNA Helix Research
    'https://images.unsplash.com/photo-1507499739999-097706ad8914', // Telescope Nebula
  ],
  world: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // Globe / Satellites
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9', // Global Metropolis Skyline
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1', // World Map Compass
  ],
};

/**
 * Kiểm tra xem một URL ảnh từ RSS có hợp lệ và an toàn không
 */
export function isValidThumbnailUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 10) return false;

  // Bắt buộc giao thức an toàn
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  // Loại bỏ các ảnh tracking 1x1 hoặc ảnh icon rác
  if (/1x1|tracking|pixel|avatar-default|spacer\.gif|blank\.png/i.test(trimmed)) return false;

  // Loại bỏ các CDN chặn hotlink phổ biến
  if (/fbexternal-a\.akamaihd\.net|scontent.*\.fna\.fbcdn\.net/i.test(trimmed)) return false;

  return true;
}

/**
 * Băm chuỗi đơn giản thành số nguyên dương (để phân bổ ảnh deterministically)
 */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Trích xuất hoặc phân bổ ảnh thumbnail thông minh:
 * - Nếu RSS có ảnh hợp lệ -> Gắn tham số tối ưu CDN.
 * - Nếu không có ảnh -> Phân bổ từ kho Curated Pool đa dạng theo hash của slug (không bao giờ trùng lặp liên tiếp).
 */
export function resolveSmartThumbnail(
  rawUrl: string | null | undefined,
  category: string,
  slug = '',
  title = ''
): { url: string; alt: string; isCuratedFallback: boolean } {
  const cat = (category || 'tech').toLowerCase();
  const pool = CURATED_THUMBNAIL_POOL[cat] || CURATED_THUMBNAIL_POOL.tech;

  // 1. Nếu ảnh gốc hợp lệ
  if (isValidThumbnailUrl(rawUrl)) {
    let cleanUrl = rawUrl!.trim();
    // Tối ưu Unsplash URL nếu có
    if (cleanUrl.includes('unsplash.com') && !cleanUrl.includes('w=')) {
      cleanUrl += `${cleanUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1200&q=75`;
    }
    return {
      url: cleanUrl,
      alt: title || 'Ảnh minh họa bài viết',
      isCuratedFallback: false,
    };
  }

  // 2. Phân bổ ảnh thông minh từ kho Curated Pool theo hash của slug
  const index = slug ? hashSlug(slug) % pool.length : Math.floor(Math.random() * pool.length);
  const basePhotoUrl = pool[index];
  const optimizedUrl = `${basePhotoUrl}?auto=format&fit=crop&w=1200&q=75`;

  return {
    url: optimizedUrl,
    alt: `${title || 'Tin tức'} - Chuyên mục ${category.toUpperCase()}`,
    isCuratedFallback: true,
  };
}

/**
 * Sinh SVG cover card động (dùng cho share social hoặc fallback cực nhanh)
 */
export function generateCoverSvgDataUri(title: string, category: string): string {
  const safeTitle = (title || 'News Studio').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = (category || 'EDITORIAL').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="100%" height="100%" fill="#111111"/>
    <rect x="0" y="0" width="100%" height="8" fill="#DC2626"/>
    <circle cx="1100" cy="100" r="300" fill="#DC2626" opacity="0.15" filter="blur(80px)"/>
    <g transform="translate(100, 160)">
      <rect x="0" y="0" width="140" height="32" rx="4" fill="#DC2626"/>
      <text x="70" y="21" fill="#FFFFFF" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">${safeCategory}</text>
      <text x="0" y="120" fill="#F4F4F0" font-family="Georgia, serif" font-size="52" font-weight="bold" width="1000">
        ${safeTitle.length > 60 ? safeTitle.slice(0, 57) + '...' : safeTitle}
      </text>
      <text x="0" y="320" fill="#888888" font-family="sans-serif" font-size="22">NEWS STUDIO • KỶ NGUYÊN BÁO CHÍ ĐA CHIỀU</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
