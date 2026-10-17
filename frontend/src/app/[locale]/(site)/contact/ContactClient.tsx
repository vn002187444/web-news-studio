'use client';

import { useState } from 'react';

export default function ContactClient() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate network delay
    setTimeout(() => setStatus('success'), 1200);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-[800px] mx-auto text-black">
      <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase mb-8 border-b-2 border-black pb-4">Liên Hệ Tòa Soạn</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <div className="font-sans leading-relaxed">
          <h2 className="text-xl font-mono uppercase tracking-widest text-gray-500 mb-6">Thông Tin Liên Hệ</h2>
          
          <div className="mb-6">
            <h3 className="font-bold mb-1">Địa chỉ</h3>
            <p>Tòa nhà Công nghệ, Quận 1<br/>Thành phố Hồ Chí Minh, Việt Nam</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-1">Đường dây nóng</h3>
            <p>0123.456.789</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-1">Email hợp tác & Góp ý</h3>
            <p className="font-mono text-sm">editor@newsstudio.vn</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-mono uppercase tracking-widest text-gray-500 mb-6">Gửi Tin Nhắn</h2>
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-md">
              <p className="text-green-700 font-medium">Cảm ơn bạn! Thông điệp của bạn đã được gửi đến ban biên tập.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
              <div>
                <label htmlFor="name" className="sr-only">Họ và tên</label>
                <input required type="text" id="name" placeholder="Họ và tên..." className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input required type="email" id="email" placeholder="Email liên hệ..." className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Nội dung</label>
                <textarea required id="message" rows={5} placeholder="Nội dung ý kiến hoặc đóng góp bài viết..." className="w-full border border-gray-300 p-3 outline-none focus:border-black transition-colors resize-y"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors self-start disabled:opacity-70"
              >
                {status === 'submitting' ? 'Đang gửi...' : 'Gửi Tòa Soạn'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
