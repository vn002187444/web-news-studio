import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(__dirname, '../src/data/posts');
const VALID_CATEGORIES = new Set([
  'world',
  'tech',
  'blockchain',
  'game',
  'finance',
  'lifestyle',
  'sports',
  'entertainment',
  'education',
  'science',
]);

const CATEGORY_MAP: Record<string, string> = {
  'dau-tu': 'finance',
  'kinh-doanh': 'finance',
  'cong-nghe': 'tech',
  'the-thao': 'sports',
  'giao-duc': 'education',
  'khoa-hoc': 'science',
  'doi-song': 'lifestyle',
  'giai-tri': 'entertainment',
  'thoi-su': 'world',
};

export function cleanContentLinks(content: string, validSlugs: Set<string>): { cleaned: string; fixedCount: number } {
  let fixedCount = 0;

  const cleaned = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (fullMatch, text, href) => {
    const trimmedHref = href.trim();
    if (!trimmedHref.startsWith('/')) {
      return fullMatch;
    }

    const [cleanPath] = trimmedHref.split(/[?#]/);
    const parts = cleanPath.split('/').filter(Boolean);

    // Case: /vi/category/slug or /en/category/slug
    if (parts.length >= 3 && (parts[0] === 'vi' || parts[0] === 'en')) {
      const locale = parts[0];
      let cat = parts[1].toLowerCase();
      const slug = parts[2];

      if (validSlugs.has(slug)) {
        return fullMatch; // Valid link to existing post
      }

      fixedCount++;
      // Remap known invalid categories
      if (CATEGORY_MAP[cat]) {
        cat = CATEGORY_MAP[cat];
      }

      if (VALID_CATEGORIES.has(cat)) {
        return `[${text}](/${locale}/${cat})`;
      }

      // If category is unknown, remove the link and keep anchor text
      return text;
    }

    // Case: /category/slug (missing locale)
    if (parts.length === 2 && !['vi', 'en'].includes(parts[0])) {
      let cat = parts[0].toLowerCase();
      const slug = parts[1];

      if (validSlugs.has(slug)) {
        if (CATEGORY_MAP[cat]) cat = CATEGORY_MAP[cat];
        return `[${text}](/vi/${cat}/${slug})`;
      }

      fixedCount++;
      if (CATEGORY_MAP[cat]) cat = CATEGORY_MAP[cat];
      if (VALID_CATEGORIES.has(cat)) {
        return `[${text}](/vi/${cat})`;
      }
      return text;
    }

    // Case: /vi/category or /en/category
    if (parts.length === 2 && (parts[0] === 'vi' || parts[0] === 'en')) {
      const locale = parts[0];
      let cat = parts[1].toLowerCase();
      if (CATEGORY_MAP[cat]) cat = CATEGORY_MAP[cat];
      if (VALID_CATEGORIES.has(cat)) {
        return `[${text}](/${locale}/${cat})`;
      }
      fixedCount++;
      return text;
    }

    return fullMatch;
  });

  return { cleaned, fixedCount };
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Posts directory not found: ${POSTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
  const validSlugs = new Set(files.map((f) => f.replace(/\.mdx$/, '')));

  console.log(`🔍 Quét ${files.length} bài viết để tìm và khắc phục dead internal links...`);

  let totalFilesUpdated = 0;
  let totalLinksFixed = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const { cleaned, fixedCount } = cleanContentLinks(content, validSlugs);

    if (fixedCount > 0) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      totalFilesUpdated++;
      totalLinksFixed += fixedCount;
    }
  }

  console.log(`✅ Hoàn thành bảo trì link bài viết:`);
  console.log(`   - Số bài viết được cập nhật: ${totalFilesUpdated}`);
  console.log(`   - Tổng số dead links đã sửa/chuyển hướng an toàn: ${totalLinksFixed}`);
}

if (require.main === module) {
  main();
}
