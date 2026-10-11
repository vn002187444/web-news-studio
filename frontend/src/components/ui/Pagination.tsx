import React from 'react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 mb-4">
      {currentPage > 1 ? (
        <Link href={`${basePath}?page=${currentPage - 1}`} className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          Prev
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded opacity-50 cursor-not-allowed">Prev</span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`${basePath}?page=${page}`}
          className={`px-3 py-1 border rounded ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link href={`${basePath}?page=${currentPage + 1}`} className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          Next
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded opacity-50 cursor-not-allowed">Next</span>
      )}
    </div>
  );
}
