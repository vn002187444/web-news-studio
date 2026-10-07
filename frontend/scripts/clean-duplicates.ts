import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSanityClient } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

// Tính độ tương đồng đơn giản giữa 2 chuỗi từ ngữ (Jaccard similarity trên tập từ)
function textSimilarity(s1: string, s2: string): number {
  const words1 = new Set(s1.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean));
  const words2 = new Set(s2.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean));
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  words1.forEach((w) => {
    if (words2.has(w)) intersection++;
  });
  
  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

async function findAndCleanDuplicates(dryRun = true) {
  console.log(`=== BẮT ĐẦU QUÉT & DỌN DẸP BÀI TRÙNG (DryRun: ${dryRun}) ===\n`);

  const sanity = getSanityClient(true);
  if (!sanity) {
    console.error('Không kết nối được Sanity với Write token!');
    return;
  }

  // 1. Lấy toàn bộ bài từ Sanity
  const sanityArticles: any[] = await sanity.fetch(
    `*[_type == "article"] | order(publishedAt desc) { _id, "slug": slug.current, title, category, publishedAt }`
  );
  console.log(`Tổng số bài trên Sanity CMS: ${sanityArticles.length}`);

  // Tìm các nhóm bài trùng lặp
  const duplicatesToDelete: { keep: any; remove: any; reason: string }[] = [];
  const processedIds = new Set<string>();

  for (let i = 0; i < sanityArticles.length; i++) {
    const a = sanityArticles[i];
    if (processedIds.has(a._id)) continue;

    for (let j = i + 1; j < sanityArticles.length; j++) {
      const b = sanityArticles[j];
      if (processedIds.has(b._id)) continue;

      const sim = textSimilarity(a.title, b.title);
      // Nếu 2 bài có tiêu đề giống nhau >= 55% từ vựng hoặc có cùng slug
      if (a.slug === b.slug || sim >= 0.55) {
        // Giữ bài cũ hơn hay mới hơn? Giữ bài có publishedAt sớm hơn (bài gốc ban đầu) hoặc có nội dung hoàn chỉnh
        const keep = a;
        const remove = b;
        processedIds.add(remove._id);
        duplicatesToDelete.push({
          keep,
          remove,
          reason: a.slug === b.slug ? 'Trùng Slug' : `Tiêu đề giống ${(sim * 100).toFixed(0)}%`,
        });
      }
    }
  }

  console.log(`\nPhát hiện ${duplicatesToDelete.length} bài viết bị trùng trên Sanity CMS:`);
  for (const dup of duplicatesToDelete) {
    console.log(`\n🔴 XÓA BẢN TRÙNG: [${dup.remove.category}] "${dup.remove.title}"`);
    console.log(`   (ID: ${dup.remove._id} | Slug: ${dup.remove.slug})`);
    console.log(`🟢 GIỮ LẠI BẢN GỐC: [${dup.keep.category}] "${dup.keep.title}"`);
    console.log(`   (ID: ${dup.keep._id} | Slug: ${dup.keep.slug})`);
    console.log(`   Lý do: ${dup.reason}`);

    if (!dryRun) {
      try {
        await sanity.delete(dup.remove._id);
        console.log(`   -> ✅ Đã xóa ID ${dup.remove._id} khỏi Sanity.`);
      } catch (e: any) {
        console.error(`   -> ❌ Lỗi xóa ${dup.remove._id}:`, e.message);
      }
    }
  }

  // 2. Dọn dẹp trong thư mục local MDX
  const POSTS_DIR = path.join(process.cwd(), 'src/data/posts');
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
    console.log(`\nTổng số file MDX local: ${files.length}`);
    
    // Nếu có file local tương ứng với các slug bị xóa trên Sanity
    const slugsToRemove = new Set(duplicatesToDelete.map((d) => d.remove.slug));
    let deletedFiles = 0;
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      if (slugsToRemove.has(slug)) {
        console.log(`- File trùng local: ${file}`);
        if (!dryRun) {
          fs.unlinkSync(path.join(POSTS_DIR, file));
          deletedFiles++;
          console.log(`  -> ✅ Đã xóa file ${file}`);
        }
      }
    }
    console.log(`Số file MDX trùng đã xóa: ${deletedFiles}`);
  }
}

// Chạy dryRun = false để xóa thật nếu truyền flag --fix
const shouldFix = process.argv.includes('--fix');
findAndCleanDuplicates(!shouldFix).catch(console.error);
