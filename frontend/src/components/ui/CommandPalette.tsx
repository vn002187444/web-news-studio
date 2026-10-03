'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/routing';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Lắng nghe phím Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (!isOpen) return; // If closed, do nothing below
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return;
        const focusable = Array.from(modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.tabIndex >= 0);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tự động focus input khi mở
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchResults('');
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const fetchResults = async (q: string) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Debounce search
  useEffect(() => {
    if (!isOpen) return;
    const delay = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [query, isOpen]);

  const handleSelect = (slug: string, category: string) => {
    setIsOpen(false);
    router.push(`/${category}/${slug}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4" role="dialog" aria-modal="true" aria-label="Tìm kiếm nhanh">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#111111] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <span className="text-white/50 mr-3" aria-hidden="true">🔍</span>
              <label htmlFor="cmdk-input" className="sr-only">Tìm kiếm bài viết</label>
              <input
                id="cmdk-input"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, chuyên mục..."
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="cmdk-list"
                className="flex-1 bg-transparent text-white font-mono outline-none placeholder:text-white/30"
              />
              <button onClick={() => setIsOpen(false)} aria-label="Đóng tìm kiếm (Esc)" className="text-xs font-mono text-white/50 hover:text-white border border-white/20 px-2 py-1 rounded">
                ESC
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((post, i) => (
                  <div 
                    key={i}
                    onClick={() => handleSelect(post.slug, post.category)}
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer rounded-xl flex flex-col gap-1 transition-colors"
                  >
                    <span className="text-[10px] uppercase font-mono tracking-widest text-red-500">{post.category}</span>
                    <span className="text-white font-serif text-lg">{post.title}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center font-mono text-sm text-white/40">
                  Không tìm thấy kết quả nào.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
