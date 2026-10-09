'use client';

import { Link, usePathname } from '@/i18n/routing';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: '⌂' },
    { name: 'Công nghệ', href: '/tech', icon: '⚛' },
    { name: 'Blockchain', href: '/blockchain', icon: '₿' },
    { name: 'Tài chính', href: '/finance', icon: '📈' },
  ];

  const triggerSearch = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      /* noop */
    }
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <nav 
      aria-label="Thanh điều hướng di động"
      className="lg:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0d0d0d]/92 backdrop-blur-2xl border-t border-white/10 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <ul className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link 
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full py-1 transition-all duration-200 relative group ${
                  isActive ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className={`text-lg leading-none transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-mono tracking-wider mt-1 truncate max-w-[64px] text-center">
                  {item.name}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-0.5 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </Link>
            </li>
          );
        })}

        {/* Nút Tìm kiếm nhanh ngay trên ngón tay cái */}
        <li className="flex-1">
          <button
            onClick={triggerSearch}
            className="flex flex-col items-center justify-center w-full h-full py-1 text-gray-400 hover:text-white transition-all duration-200 active:scale-95"
            aria-label="Mở tìm kiếm"
          >
            <span className="text-base leading-none">🔍</span>
            <span className="text-[10px] font-mono tracking-wider mt-1">Tìm kiếm</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
