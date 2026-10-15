import Link from 'next/link';

export default function NotFound() {
  const categories = [
    { name: 'Thời Sự', href: '/vi/world' },
    { name: 'Công Nghệ', href: '/vi/tech' },
    { name: 'Blockchain', href: '/vi/blockchain' },
    { name: 'Tài Chính', href: '/vi/finance' },
    { name: 'Esports', href: '/vi/game' },
    { name: 'Đời Sống', href: '/vi/lifestyle' },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#F4F4F0] text-[#111111]">
      <div className="max-w-2xl mx-auto text-center">
        <span className="font-mono text-xs tracking-widest uppercase text-red-600 font-bold px-3 py-1 bg-red-100/70 border border-red-200 rounded-full inline-block mb-6">
          Lỗi 404 • Không Tìm Thấy Trang
        </span>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Bản Tin Không Tồn Tại
        </h1>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
          Bài viết hoặc liên kết bạn đang tìm kiếm có thể đã được cập nhật đường dẫn mới, tạm ẩn hoặc không tồn tại trên hệ thống.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link
            href="/vi"
            className="px-6 py-3 bg-[#111111] text-white hover:bg-red-600 transition-colors font-medium rounded-md shadow-sm"
          >
            ← Về Trang Chủ
          </Link>
          <Link
            href="/vi/blockchain"
            className="px-6 py-3 bg-white text-[#111111] border border-gray-300 hover:border-black transition-colors font-medium rounded-md shadow-sm"
          >
            Chuyên Mục Blockchain
          </Link>
        </div>

        <div className="border-t border-gray-200/80 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
            Khám phá các chuyên mục tin tức
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="px-3 py-1.5 text-xs bg-white text-gray-700 hover:text-black border border-gray-200 rounded-full transition-all hover:border-gray-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
