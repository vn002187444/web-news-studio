import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật',
  description: 'Cam kết bảo mật dữ liệu độc giả, chính sách thu thập thông tin bản tin, cookies và quyền riêng tư tại NewsStudio.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[800px] mx-auto text-black">
      <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-8 border-b-2 border-black pb-4">Chính Sách Bảo Mật</h1>
      
      <div className="prose prose-lg text-black font-sans leading-relaxed">
        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">1. Thu thập thông tin</h2>
        <p>Chúng tôi chỉ thu thập email khi bạn đăng ký bản tin (newsletter) hoặc thông tin cá nhân khi bạn tự nguyện gửi qua form liên hệ. Dữ liệu này được mã hóa và lưu trữ an toàn.</p>
        
        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">2. Sử dụng Cookies</h2>
        <p>NewsStudio sử dụng cookies để phân tích lưu lượng truy cập và tối ưu hóa trải nghiệm đọc báo (ví dụ: ghi nhớ trạng thái preloader hoặc sở thích xem). Bạn có thể vô hiệu hóa cookies trong trình duyệt của mình bất cứ lúc nào.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">3. Cam kết bảo mật</h2>
        <p>Chúng tôi tuyệt đối không bán, trao đổi hoặc chia sẻ dữ liệu cá nhân của độc giả cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>

        <h2 className="text-2xl font-serif font-bold mt-12 mb-4 uppercase">4. Quyền của bạn</h2>
        <p>Bạn có quyền yêu cầu trích xuất hoặc xóa toàn bộ dữ liệu cá nhân của mình khỏi hệ thống NewsStudio. Vui lòng liên hệ với Tòa soạn để được hỗ trợ.</p>
      </div>
    </div>
  );
}
export function generateStaticParams() { return [{ locale: 'vi' }, { locale: 'en' }]; }
