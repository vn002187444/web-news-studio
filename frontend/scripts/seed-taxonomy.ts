/**
 * Seed mock Tác giả + Danh mục (S3). Chạy: npm run seed-taxonomy
 * Idempotent: dùng _id cố định, createOrReplace.
 */
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN || '';
const apiVersion = process.env.SANITY_API_VERSION || '2026-01-01';

if (!projectId || !token) {
  console.error('Thiếu SANITY_PROJECT_ID hoặc SANITY_API_TOKEN.');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token });

const AUTHORS = [
  { v: 'tech', name: 'Minh Quân', role: 'Biên tập viên Công nghệ', bio: 'Theo dõi AI, smartphone và startup Việt Nam hơn 8 năm. Ưu tiên kiểm chứng nguồn trước tốc độ.', icon: '💻' },
  { v: 'finance', name: 'Lan Anh', role: 'Chuyên gia Tài chính', bio: 'Phân tích chứng khoán, vĩ mô và thị trường tiền tệ. CFA với 10 năm kinh nghiệm ngân hàng.', icon: '📈' },
  { v: 'blockchain', name: 'Đức Huy', role: 'Analyst Web3', bio: 'Nghiên cứu Bitcoin, DeFi và on-chain data. Tin vào minh bạch số liệu hơn lời đồn.', icon: '⛓️' },
  { v: 'game', name: 'Hoàng Nam', role: 'Biên tập viên Game', bio: 'Esports và game PC/Console/Mobile. Từng bình luận các giải đấu lớn khu vực.', icon: '🎮' },
  { v: 'sports', name: 'Quốc Bảo', role: 'Phóng viên Thể thao', bio: 'Bóng đá Việt Nam và quốc tế, có mặt tại nhiều kỳ SEA Games và AFF Cup.', icon: '⚽' },
  { v: 'entertainment', name: 'Mỹ Linh', role: 'Biên tập viên Giải trí', bio: 'Điện ảnh, âm nhạc và văn hóa đại chúng. Săn tin hậu trường có kiểm chứng.', icon: '🎬' },
  { v: 'education', name: 'Thu Hà', role: 'Phóng viên Giáo dục', bio: 'Giáo dục phổ thông, đại học và du học. Đồng hành cùng phụ huynh và Gen Z.', icon: '🎓' },
  { v: 'science', name: 'Tiến Dũng', role: 'Biên tập viên Khoa học', bio: 'Vũ trụ, môi trường và công nghệ sinh học. Dịch khoa học khó thành chuyện dễ hiểu.', icon: '🔬' },
  { v: 'lifestyle', name: 'Phương Thảo', role: 'Biên tập viên Đời sống', bio: 'Du lịch, sức khỏe và phong cách sống. Review trải nghiệm thực tế, không PR.', icon: '🌿' },
];

const CATEGORIES: Record<string, { title: string; description: string; color: string }> = {
  tech: { title: 'Công Nghệ', description: 'Tin công nghệ, AI, smartphone và startup mới nhất.', color: '#0891B2' },
  finance: { title: 'Tài Chính', description: 'Chứng khoán, bất động sản và kinh tế vĩ mô.', color: '#DC2626' },
  blockchain: { title: 'Blockchain', description: 'Giá Bitcoin, Web3, NFT và DeFi cập nhật.', color: '#7C3AED' },
  game: { title: 'Game', description: 'Esports, review game PC/Console và mobile.', color: '#16A34A' },
  sports: { title: 'Thể Thao', description: 'Bóng đá, giải đấu và tin thể thao.', color: '#65A30D' },
  entertainment: { title: 'Giải Trí', description: 'Điện ảnh, âm nhạc và văn hóa đại chúng.', color: '#C026D3' },
  education: { title: 'Giáo Dục', description: 'Tri thức số và kỹ năng tương lai.', color: '#1D4ED8' },
  science: { title: 'Khoa Học', description: 'Vũ trụ, phát minh và công nghệ sinh học.', color: '#0D9488' },
  lifestyle: { title: 'Đời Sống', description: 'Phong cách sống, du lịch và xu hướng Gen Z.', color: '#059669' },
};

async function main() {
  for (const a of AUTHORS) {
    const slug = a.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
    await client.createOrReplace({
      _type: 'author',
      _id: `author-${a.v}`,
      name: a.name,
      slug: { _type: 'slug', current: slug },
      role: a.role,
      bio: a.bio,
      avatar: `https://i.pravatar.cc/150?u=${a.v}-editor`,
      beats: [a.v],
    });
    console.log(`✅ author: ${a.name} (${a.v})`);
  }
  for (const a of AUTHORS) {
    const c = CATEGORIES[a.v];
    await client.createOrReplace({
      _type: 'categoryDoc',
      _id: `category-${a.v}`,
      title: c.title,
      value: a.v,
      description: c.description,
      icon: a.icon,
      color: c.color,
    });
    console.log(`✅ category: ${c.title} ${a.icon} (${a.v})`);
  }
  console.log('🏁 Seed taxonomy xong: 9 authors + 9 categories.');
}

main().catch((e) => { console.error(e); process.exit(1); });
