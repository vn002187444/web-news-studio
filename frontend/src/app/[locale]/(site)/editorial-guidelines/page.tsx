import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quy Chuẩn Biên Tập & Minh Bạch AI',
  description: 'Tiêu chuẩn đạo đức báo chí, quy trình kiểm chứng thông tin và tuyên bố minh bạch về việc ứng dụng AI tại News Studio.',
};

export default function EditorialGuidelinesPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[800px] mx-auto text-black">
      <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-8 border-b-2 border-black pb-4">Quy Chuẩn Biên Tập & Minh Bạch AI</h1>
      
      <div className="prose prose-lg text-black font-sans leading-relaxed">
        <p className="font-mono text-sm uppercase text-gray-600 mb-8">
          Tiêu chuẩn đạo đức báo chí, quy trình kiểm chứng thông tin và tuyên bố minh bạch về việc ứng dụng AI tại News Studio.
        </p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">1. Tôn chỉ & Đạo đức nghề nghiệp</h2>
        <p>Chúng tôi cam kết đảm bảo tính chính xác, khách quan, đa chiều và kiểm chứng nguồn tin độc lập. Mọi bài viết trên News Studio đều được đối chiếu với nhiều nguồn tin cậy trước khi xuất bản, tôn trọng sự thật và không định kiến.</p>
        
        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">2. Tuyên bố minh bạch ứng dụng Trí tuệ Nhân tạo</h2>
        <p>AI tại News Studio chỉ đóng vai trò hỗ trợ tổng hợp dữ liệu, lọc rác thông tin và trích xuất sự kiện. Con người (Ban Biên Tập) luôn là chốt chặn cuối cùng kiểm duyệt chất lượng nội dung trước khi xuất bản. Chúng tôi không sử dụng AI để tự động tạo nội dung không có sự giám sát của biên tập viên.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">3. Quy trình xử lý đính chính và phản hồi</h2>
        <p>Chúng tôi luôn tiếp nhận phản hồi từ bạn đọc và sẵn sàng đính chính nhanh chóng những sai sót (nếu có). Mọi thông tin đính chính đều được ghi nhận rõ ràng vào lịch sử cập nhật của bài viết một cách minh bạch nhất.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">4. Tôn trọng bản quyền & Dẫn nguồn</h2>
        <p>Khi tổng hợp tin tức trong nước và quốc tế, News Studio luôn trích dẫn bài gốc rõ ràng, tôn trọng bản quyền của tác giả và các đơn vị báo chí, xuất bản. Mọi hành vi sao chép không xin phép đều trái với tôn chỉ hoạt động của chúng tôi.</p>
      </div>
    </div>
  );
export function generateStaticParams() { return [{ locale: 'vi' }, { locale: 'en' }]; }
