'use client';

import { useEffect, useState, useRef } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import MagneticButton from './MagneticButton';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from './SearchProvider';

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Đóng dropdown khi chuyển trang
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  // Danh mục đầy đủ với mô tả & icon
  const allCategories = [
    { href: '/tech', key: 'tech', label: t('tech'), icon: '⚛', desc: 'Trí tuệ nhân tạo, thiết bị & phần mềm', badge: '3D WebGL' },
    { href: '/blockchain', key: 'blockchain', label: t('blockchain'), icon: '₿', desc: 'Web3, tiền mã hóa & hợp đồng thông minh', badge: 'Bloom' },
    { href: '/finance', key: 'finance', label: t('finance'), icon: '📈', desc: 'Thị trường tài chính, chứng khoán & vĩ mô', badge: 'Live' },
    { href: '/game', key: 'game', label: t('game'), icon: '✜', desc: 'Đấu trường Esports, PC Master Race & Mobile', badge: 'Esports' },
    { href: '/lifestyle', key: 'lifestyle', label: t('lifestyle'), icon: '✦', desc: 'Phong cách sống đương đại, nghệ thuật sống', badge: 'Curated' },
    { href: '/sports', key: 'sports', label: t('sports'), icon: '⚽', desc: 'Tin tức thể thao đỉnh cao, bóng đá & giải đấu' },
    { href: '/entertainment', key: 'entertainment', label: t('entertainment'), icon: '🎬', desc: 'Điện ảnh, âm nhạc & văn hóa đại chúng' },
    { href: '/education', key: 'education', label: t('education'), icon: '🎓', desc: 'Tri thức số, kỹ năng tương lai & học thuật' },
    { href: '/science', key: 'science', label: t('science'), icon: '🔬', desc: 'Khám phá vũ trụ, phát minh & công nghệ sinh học' },
  ];

  // Quick categories: hiện đủ 9 chuyên mục trên thanh menu ngang (màn xl+)
  const quickCategories = allCategories;

  const { openSearch } = useSearch();

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 pointer-events-auto ${
        scrolled 
          ? 'bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Logo & Category Dropdown Trigger */}
        <div className="flex items-center gap-3 sm:gap-6">
          <MagneticButton>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1.5 group">
              <div className="flex flex-col gap-[3px]">
                <div className="w-4 h-[2px] bg-red-500 transition-all group-hover:w-5"></div>
                <div className="w-3 h-[2px] bg-white transition-all group-hover:w-4"></div>
                <div className="w-5 h-[2px] bg-white"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold uppercase tracking-tighter text-white">
                News<span className="font-light italic text-red-500">Studio</span>
              </span>
            </Link>
          </MagneticButton>

          {/* NÚT DROPDOWN CHUYÊN MỤC (Accessible on both Desktop & Tablet) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 font-mono text-xs uppercase px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
                isDropdownOpen 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="Mở danh sách chuyên mục"
            >
              <span className="text-sm">☰</span>
              <span className="tracking-wider font-semibold">{t('categories')}</span>
              <motion.span 
                animate={{ rotate: isDropdownOpen ? 180 : 0 }} 
                transition={{ duration: 0.2 }}
                className="text-[10px] opacity-70"
              >
                ▼
              </motion.span>
            </button>

            {/* DROPDOWN MEGA-MENU POPUP */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 mt-3 w-[92vw] sm:w-[540px] md:w-[680px] lg:w-[760px] max-w-[800px] bg-[#111111]/98 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 text-white overflow-hidden"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                        {t('all_categories')}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/40 uppercase hidden sm:inline">
                      9 Chuyên Mục Chuyên Sâu
                    </span>
                  </div>

                  {/* Grid 9 Chuyên Mục */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-[65vh] overflow-y-auto pr-1">
                    {allCategories.map((cat) => {
                      const isActive = pathname.startsWith(cat.href);
                      return (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 group ${
                            isActive
                              ? 'bg-red-500/15 border-red-500/50 text-white'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white'
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                            {cat.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-mono text-xs uppercase tracking-wider font-bold truncate ${isActive ? 'text-red-400' : 'group-hover:text-red-400'} transition-colors`}>
                                {cat.label}
                              </h4>
                              {cat.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70 uppercase">
                                  {cat.badge}
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-[11px] text-white/50 line-clamp-1 mt-0.5 leading-snug group-hover:text-white/70 transition-colors">
                              {cat.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <span className="text-red-500">●</span> Hệ thống cập nhật tin tự động mỗi giờ
                    </span>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openSearch();
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
                    >
                      Tìm kiếm bài viết (⌘K)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Center: Quick Links on Large Desktops */}
        <nav className="hidden xl:flex items-center gap-0.5 font-mono text-xs tracking-wider uppercase">
          {quickCategories.map((cat) => {
            const isActive = pathname.startsWith(cat.href);
            return (
              <MagneticButton key={cat.href}>
                <Link 
                  href={cat.href} 
                  className={`relative px-2.5 py-1.5 rounded-full transition-all duration-200 block whitespace-nowrap ${
                    isActive 
                      ? 'text-red-500 font-bold bg-white/10' 
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`} 
                  data-cursor={cat.key.toUpperCase()}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Link>
              </MagneticButton>
            );
          })}
        </nav>

        {/* Right Actions: Lang Switcher & Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex font-mono text-[11px] border border-white/20 rounded-full overflow-hidden bg-black/40 backdrop-blur-md p-[2px]">
            <Link 
              href={pathname} 
              locale="vi" 
              className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                currentLocale === 'vi' 
                  ? 'bg-red-600 text-white font-bold shadow-sm' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              VI
            </Link>
            <Link 
              href={pathname} 
              locale="en" 
              className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                currentLocale === 'en' 
                  ? 'bg-red-600 text-white font-bold shadow-sm' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              EN
            </Link>
          </div>

          {/* Quick Search Button */}
          <MagneticButton>
            <button 
              onClick={openSearch}
              className="flex items-center gap-2 font-mono text-xs border border-white/20 bg-white/5 hover:bg-white hover:text-black text-white px-3 sm:px-4 py-1.5 rounded-full transition-all duration-300 backdrop-blur-md group shadow-sm" 
              data-cursor="SEARCH"
              aria-label="Tìm kiếm bài viết (Cmd+K)"
            >
              <span className="text-sm">🔍</span>
              <span className="hidden sm:inline uppercase text-[11px] tracking-wider">Tìm kiếm</span>
              <kbd className="hidden md:inline text-[9px] bg-white/20 group-hover:bg-black/10 px-1.5 py-0.5 rounded font-mono border border-white/20">
                ⌘K
              </kbd>
            </button>
          </MagneticButton>
        </div>

      </div>
    </header>
  );
}
