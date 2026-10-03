'use client';

import { Link, usePathname } from '@/i18n/routing';
import MagneticButton from './MagneticButton';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-6 py-6 mix-blend-difference text-white pointer-events-auto">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <MagneticButton>
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity block p-2">
            <div className="flex flex-col gap-[2px]">
              <div className="w-4 h-[2px] bg-white"></div>
              <div className="w-3 h-[2px] bg-white"></div>
              <div className="w-4 h-[2px] bg-white"></div>
            </div>
            <span className="text-2xl font-bold uppercase tracking-tighter">News<span className="font-light italic text-red-500">Studio</span></span>
          </Link>
        </MagneticButton>
        
        <nav className="hidden md:flex gap-4 font-mono text-xs tracking-widest uppercase">
          <MagneticButton><Link href="/tech" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="TECH">{t('tech')}</Link></MagneticButton>
          <MagneticButton><Link href="/blockchain" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="WEB3">{t('blockchain')}</Link></MagneticButton>
          <MagneticButton><Link href="/game" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="PLAY">{t('game')}</Link></MagneticButton>
          <MagneticButton><Link href="/finance" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="TRADE">{t('finance')}</Link></MagneticButton>
          <MagneticButton><Link href="/sports" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="SPORT">{t('sports')}</Link></MagneticButton>
          <MagneticButton><Link href="/entertainment" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="SHOW">{t('entertainment')}</Link></MagneticButton>
          <MagneticButton><Link href="/education" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="EDU">{t('education')}</Link></MagneticButton>
          <MagneticButton><Link href="/science" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="SCI">{t('science')}</Link></MagneticButton>
          <MagneticButton><Link href="/lifestyle" className="hover:opacity-70 transition-opacity p-2 block" data-cursor="CHILL">{t('lifestyle')}</Link></MagneticButton>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex font-mono text-xs border border-white/30 rounded-full overflow-hidden">
            <Link href={pathname} locale="vi" className="px-3 py-2 hover:bg-white/20 transition-colors">VI</Link>
            <Link href={pathname} locale="en" className="px-3 py-2 hover:bg-white/20 border-l border-white/30 transition-colors">EN</Link>
          </div>
          <MagneticButton>
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="uppercase font-mono text-xs border border-white/30 px-5 py-2 rounded-full hover:bg-white hover:text-black transition-colors duration-300 ml-2" 
              data-cursor="SEARCH"
            >
              Cmd+K 
            </button>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
