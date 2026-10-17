import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều Khoản Dịch Vụ',
  description: 'Điều khoản sử dụng dịch vụ, bản quyền nội dung báo chí, quy định trích dẫn nguồn, miễn trừ trách nhiệm của NewsStudio.',
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[800px] mx-auto text-black">
      <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-8 border-b-2 border-black pb-4">Điều Khoản Dịch Vụ</h1>
      
      <div className="prose prose-lg text-black font-sans leading-relaxed">
        <p className="font-mono text-sm text-gray-600 mb-8">
          Cập nhật lần cuối: 24/10/2026
        </p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">1. Chấp nhận điều khoản</h2>
        <p>Bằng việc truy cập và sử dụng nền tảng NewsStudio, bạn đồng ý tuân thủ các điều khoản dịch vụ dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>
        
        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">2. Bản quyền nội dung</h2>
        <p>Toàn bộ nội dung, hình ảnh, video và đồ họa trên NewsStudio đều thuộc bản quyền của chúng tôi hoặc các đối tác cung cấp. Việc sao chép, phát hành lại mà không có sự cho phép bằng văn bản là vi phạm pháp luật.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">3. Quy định trích dẫn</h2>
        <p>Cho phép trích dẫn tối đa 20% nội dung bài viết với mục đích phi thương mại, và phải ghi rõ nguồn "Theo NewsStudio" kèm liên kết trỏ về bài viết gốc.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">4. Miễn trừ trách nhiệm</h2>
        <p>Các thông tin về thị trường, tài chính, blockchain và tiền mã hóa trên NewsStudio chỉ mang tính chất tham khảo, không cấu thành lời khuyên đầu tư. Chúng tôi không chịu trách nhiệm cho bất kỳ rủi ro hay tổn thất nào phát sinh từ các quyết định dựa trên những thông tin này.</p>
      </div>
    </div>
  );
export function generateStaticParams() { return [{ locale: 'vi' }, { locale: 'en' }]; }
