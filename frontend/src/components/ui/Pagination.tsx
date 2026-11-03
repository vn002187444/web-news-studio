'use client';

import { Link } from '@/i18n/routing';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    // Trang 1 không đính kèm query param ?page=1 để tránh duplicate content trên Googlebot
    if (page <= 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12 mb-8 font-mono text-sm">
      {/* Nút Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-black dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          Trang trước
        </Link>
      ) : (
        <span className="px-4 py-2 border border-gray-300 dark:border-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed">
          Trang trước
        </span>
      )}

      {/* Danh sách số trang */}
      <div className="flex gap-1 mx-2">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = pageNum === currentPage;
          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                isActive
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Nút Next */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-black dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          Trang sau
        </Link>
      ) : (
        <span className="px-4 py-2 border border-gray-300 dark:border-neutral-800 text-gray-400 dark:text-neutral-600 cursor-not-allowed">
          Trang sau
        </span>
      )}
    </div>
  );
}
