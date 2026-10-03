'use client';

import { motion } from 'framer-motion';

const TickerItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-4 mx-4">
    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
    <span className="font-mono text-xs uppercase tracking-widest">{text}</span>
  </div>
);

export default function NewsTicker() {
  const news = [
    "APPLE RA MẮT KÍNH AR THẾ HỆ MỚI VỚI CHIP M5",
    "BITCOIN VƯỢT MỐC $120,000 SAU KHI ETF ĐƯỢC PHÊ DUYỆT RỘNG RÃI",
    "AI TRỞ THÀNH CEO CHO CÔNG TY KHỞI NGHIỆP TẠI THUNG LŨNG SILICON",
    "GTA 6 ĐẠT KỶ LỤC 1 TỶ USD DOANH THU TRONG 12 GIỜ ĐẦU TIÊN",
    "THỊ TRƯỜNG CHỨNG KHOÁN CHÂU Á XANH SÀN NHỜ CHÍNH SÁCH NỚI LỎNG"
  ];

  return (
    <div className="w-full border-y border-[#111111]/10 py-3 overflow-hidden bg-[#F4F4F0] flex items-center">
      <motion.div
        className="flex whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {/* Duplicate the array to create seamless loop */}
        {[...news, ...news].map((text, i) => (
          <TickerItem key={i} text={text} />
        ))}
      </motion.div>
    </div>
  );
}
