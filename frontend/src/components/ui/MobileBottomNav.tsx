'use client';

import { Link, usePathname } from '@/i18n/routing';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: '⌂' },
    { name: 'Công nghệ', href: '/tech', icon: '⚛' },
    { name: 'Blockchain', href: '/blockchain', icon: '₿' },
    { name: 'Esports', href: '/game', icon: '✜' },
    { name: 'Tài chính', href: '/finance', icon: '📈' },
    { name: 'Đời sống', href: '/lifestyle', icon: '✦' },
    { name: 'Thể thao', href: '/sports', icon: '⚽' },
    { name: 'Giải trí', href: '/entertainment', icon: '🎬' },
    { name: 'Giáo dục', href: '/education', icon: '🎓' },
    { name: 'Khoa học', href: '/science', icon: '🔬' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#111111]/95 backdrop-blur-xl border-t border-white/10 text-white pb-safe">
      <ul className="flex items-center h-16 px-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full py-1 gap-1 transition-colors ${
                  isActive ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[9px] font-mono uppercase tracking-wider truncate max-w-[55px] text-center">
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
