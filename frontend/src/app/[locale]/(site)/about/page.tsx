import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Về Chúng Tôi',
  description: 'Tôn chỉ hoạt động của NewsStudio: Báo chí thế hệ mới kết hợp AI phân tích dữ liệu chuyên sâu và trực quan hóa 3D/WebGL.',
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[800px] mx-auto text-black">
      <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-8 border-b-2 border-black pb-4">Về Chúng Tôi</h1>
      
      <div className="prose prose-lg text-black font-sans leading-relaxed">
        <p className="font-mono text-sm uppercase text-gray-600 mb-8">
          Tôn chỉ hoạt động của NewsStudio: Báo chí thế hệ mới kết hợp AI phân tích dữ liệu chuyên sâu và trực quan hóa 3D/WebGL.
        </p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">Tiêu chuẩn biên tập</h2>
        <p>Chúng tôi cam kết mang đến những thông tin chính xác, đa chiều và được kiểm chứng kỹ lưỡng. Đội ngũ biên tập của NewsStudio luôn tuân thủ các nguyên tắc đạo đức nghề nghiệp khắt khe nhất.</p>
        
        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">Đội ngũ & Công nghệ</h2>
        <p>Sự kết hợp giữa những nhà báo dày dạn kinh nghiệm và nền tảng công nghệ phân tích dữ liệu tiên tiến. Chúng tôi sử dụng AI để tổng hợp, nhưng con người luôn là yếu tố quyết định cuối cùng trong việc định hướng nội dung.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">Sứ mệnh</h2>
        <p>NewsStudio ra đời với sứ mệnh xây dựng một hệ sinh thái tin tức minh bạch, hiện đại, giúp độc giả nắm bắt nhanh chóng và sâu sắc mọi chuyển động của thế giới công nghệ, tài chính và đời sống.</p>
      </div>
    </div>
  );
}
