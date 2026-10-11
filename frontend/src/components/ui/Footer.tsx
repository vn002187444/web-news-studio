'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch { /* noop */ }
    try { localStorage.setItem('newsletter-email', email); } catch { /* noop */ }
    setDone(true);
  };

  return (
    <footer className="bg-black text-white py-16 px-6 relative z-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-4xl font-bold uppercase tracking-tighter mb-4">
            News<span className="font-light italic text-red-500">Studio</span>
          </h2>
          <p className="text-white/60 max-w-sm mb-8 font-mono text-xs leading-relaxed">
            Siêu nền tảng báo chí công nghệ đa chiều thế hệ mới. Đem đến trải nghiệm thị giác ấn tượng và dữ liệu thời gian thực cho độc giả Việt Nam.
          </p>
          <form onSubmit={subscribe} className="flex border-b border-white/20 pb-2 max-w-sm" aria-label="Đăng ký nhận bản tin">
            <label htmlFor="newsletter-email" className="sr-only">Email nhận tin</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="NHẬP EMAIL CỦA BẠN..."
              aria-label="Email nhận tin"
              className="bg-transparent border-none outline-none flex-grow font-mono text-xs uppercase placeholder:text-white/30"
            />
            <button type="submit" aria-label="Đăng ký" className="font-mono text-xs uppercase hover:text-red-400 transition-colors">
              {done ? '✓ Đã Đăng Ký' : 'Đăng Ký'}
            </button>
          </form>
          {done && <p role="status" className="font-mono text-[11px] text-green-400 mt-2">Đã lưu — Bạn sẽ nhận được bản tin tổng hợp mỗi ngày.</p>}
        </div>
        
        <div>
          <h3 className="font-mono text-xs uppercase text-white/40 mb-6">Chuyên mục</h3>
          <ul className="flex flex-col gap-4 font-medium">
            <li><Link href="/tech" className="hover:text-red-400 transition-colors">Công Nghệ</Link></li>
            <li><Link href="/blockchain" className="hover:text-red-400 transition-colors">Blockchain</Link></li>
            <li><Link href="/game" className="hover:text-red-400 transition-colors">Esports & Gaming</Link></li>
            <li><Link href="/finance" className="hover:text-red-400 transition-colors">Tài Chính</Link></li>
            <li><Link href="/sports" className="hover:text-red-400 transition-colors">Thể thao</Link></li>
            <li><Link href="/entertainment" className="hover:text-red-400 transition-colors">Giải trí</Link></li>
            <li><Link href="/education" className="hover:text-red-400 transition-colors">Giáo Dục</Link></li>
            <li><Link href="/science" className="hover:text-red-400 transition-colors">Khoa Học</Link></li>
            <li><Link href="/lifestyle" className="hover:text-red-400 transition-colors">Đời Sống</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase text-white/40 mb-6">Thông tin</h3>
          <ul className="flex flex-col gap-4 font-medium">
            <li><Link href="/" className="hover:text-red-400 transition-colors">Về Chúng Tôi</Link></li>
            <li><Link href="/" className="hover:text-red-400 transition-colors">Điều Khoản Dịch Vụ</Link></li>
            <li><Link href="/" className="hover:text-red-400 transition-colors">Chính Sách Bảo Mật</Link></li>
            <li><Link href="/" className="hover:text-red-400 transition-colors">Liên Hệ Tòa Soạn</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] uppercase text-white/30">
        <p>© 2026 News Studio. Bản quyền được bảo lưu.</p>
        <p>Nền tảng báo chí công nghệ thế hệ mới.</p>
      </div>
    </footer>
  );
}
