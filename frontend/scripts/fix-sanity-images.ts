import dotenv from 'dotenv';
import path from 'path';
import { getSanityClient } from '../src/lib/sanity';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const REPLACEMENTS: Record<string, string> = {
  'photo-1622979135225-d2ba269bc1df': 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1200&q=75',
  'photo-1508098682722-e99c43a406b2': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=75',
  'photo-1517649763962-0c623266ddc0': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=75',
  'photo-1523050854058-8df90110c9f1': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=75',
  'photo-1477959858617-67f30bc75b82': 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=75',
};

async function fixSanityImages() {
  console.log('🔧 Đang kết nối Sanity với write token...');
  const client = getSanityClient(true);
  if (!client) {
    console.error('❌ Sanity write client chưa được cấu hình token.');
    return;
  }

  const articles: any[] = await client.fetch(`*[_type == "article"]{ _id, title, "slug": slug.current, thumbnail, "metaThumb": meta.thumbnail }`);
  console.log(`Tìm thấy ${articles.length} bài trên Sanity CMS.`);

  let patched = 0;
  for (const a of articles) {
    const thumb = a.thumbnail || a.metaThumb || '';
    for (const [brokenKey, newUrl] of Object.entries(REPLACEMENTS)) {
      if (thumb.includes(brokenKey)) {
        console.log(`Cập nhật ảnh cho bài: [${a.slug}] ${a.title}`);
        await client
          .patch(a._id)
          .set({ thumbnail: newUrl, 'meta.thumbnail': newUrl })
          .commit();
        patched++;
        break;
      }
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã sửa thành công ${patched} bài viết trên Sanity CMS.`);
}

fixSanityImages().catch(e => {
  console.error('Lỗi sửa Sanity:', e);
});
