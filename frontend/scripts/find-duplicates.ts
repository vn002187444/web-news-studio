import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSanityClient } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  console.log('=== KIỂM TRA BÀI VIẾT TRÙNG LẶP ===\n');

  // 1. Kiểm tra trong posts-manifest.json
  const manifestPath = path.join(process.cwd(), 'src/data/posts-manifest.json');
  let localPosts: any[] = [];
  if (fs.existsSync(manifestPath)) {
    localPosts = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`1. Tổng số bài trong Local Manifest: ${localPosts.length}`);
  }

  // 2. Kiểm tra trong Sanity
  let sanityPosts: any[] = [];
  try {
    const sanity = getSanityClient(false);
    if (sanity) {
      sanityPosts = await sanity.fetch(`*[_type == "article"] { _id, "slug": slug.current, title, publishedAt, category }`);
      console.log(`2. Tổng số bài trong Sanity CMS: ${sanityPosts.length}`);
    }
  } catch (e: any) {
    console.error('Lỗi kết nối Sanity:', e.message);
  }

  // 3. Tìm trùng slug trong Sanity
  const sanitySlugMap: Record<string, any[]> = {};
  sanityPosts.forEach((p) => {
    if (!sanitySlugMap[p.slug]) sanitySlugMap[p.slug] = [];
    sanitySlugMap[p.slug].push(p);
  });
  const sanityDupSlugs = Object.entries(sanitySlugMap).filter(([_, items]) => items.length > 1);
  if (sanityDupSlugs.length > 0) {
    console.log(`\n⚠️ Có ${sanityDupSlugs.length} slug bị trùng trong Sanity:`);
    sanityDupSlugs.forEach(([slug, items]) => {
      console.log(` - Slug: "${slug}" (${items.length} bài) - IDs: ${items.map((i) => i._id).join(', ')}`);
    });
  } else {
    console.log('\n✅ Không có slug nào bị trùng lặp trong Sanity.');
  }

  // 4. Tìm bài trùng tiêu đề hoặc gần giống trong Sanity
  console.log('\n--- Kiểm tra tiêu đề tương đồng / trùng lặp trên Sanity ---');
  const titleMatches: any[] = [];
  for (let i = 0; i < sanityPosts.length; i++) {
    for (let j = i + 1; j < sanityPosts.length; j++) {
      const t1 = (sanityPosts[i].title || '').toLowerCase().trim();
      const t2 = (sanityPosts[j].title || '').toLowerCase().trim();
      // So sánh trùng hoặc slug gần giống
      if (t1 && t2 && (t1 === t2 || (t1.length > 20 && t2.length > 20 && (t1.includes(t2.slice(0, 30)) || t2.includes(t1.slice(0, 30)))))) {
        titleMatches.push({ a: sanityPosts[i], b: sanityPosts[j] });
      }
    }
  }
  console.log(`Tìm thấy ${titleMatches.length} cặp bài có tiêu đề trùng hoặc rất giống nhau:`);
  titleMatches.slice(0, 20).forEach(({ a, b }) => {
    console.log(` - Bài 1: [${a.category}] "${a.title}" (slug: ${a.slug}, id: ${a._id})`);
    console.log(`   Bài 2: [${b.category}] "${b.title}" (slug: ${b.slug}, id: ${b._id})`);
  });

  // 5. Kiểm tra giao thoa giữa Sanity và Local MDX (UnifiedPosts)
  console.log('\n--- Kiểm tra giao thoa Sanity & Local MDX (getAllPostsUnified) ---');
  const sanitySlugs = new Set(sanityPosts.map((p) => p.slug));
  const sanityTitles = new Set(sanityPosts.map((p) => (p.title || '').toLowerCase().trim()));
  
  const mdxOverlapSlugs: string[] = [];
  const mdxOverlapTitles: any[] = [];
  localPosts.forEach((lp) => {
    if (sanitySlugs.has(lp.slug)) {
      mdxOverlapSlugs.push(lp.slug);
    }
    const t = (lp.meta?.title || '').toLowerCase().trim();
    if (sanityTitles.has(t)) {
      mdxOverlapTitles.push({ slug: lp.slug, title: lp.meta?.title });
    }
  });

  console.log(`- Số bài local có slug trùng Sanity: ${mdxOverlapSlugs.length} (Đã được lọc qua Set slug trong getAllPostsUnified)`);
  console.log(`- Số bài local có tiêu đề trùng Sanity NHƯNG khác slug: ${mdxOverlapTitles.filter(t => !sanitySlugs.has(t.slug)).length}`);
  mdxOverlapTitles.filter(t => !sanitySlugs.has(t.slug)).forEach((t) => {
    console.log(`   * Local slug "${t.slug}" có title trùng với bài trên Sanity!`);
  });
}

main().catch(console.error);
