'use client';

import Link from 'next/link';

export default function ScienceTemplate({ articles }: { articles: any[] }) {
  const scienceArticles = articles && articles.length > 0 ? articles : [];
  
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-[#008080]">
          Data <span className="text-[#ff7f50]">Storytelling</span>
        </h1>
        <p className="text-xl text-gray-500 mb-16 max-w-2xl">
          Phân tích chuyên sâu về Khoa học, Môi trường và Biến đổi khí hậu qua góc nhìn dữ liệu trực quan.
        </p>

        {/* Data Storytelling Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Scrollytelling Feature */}
          <div className="md:col-span-8">
            {scienceArticles.slice(0, 1).map((article, i) => (
              <Link key={i} href={`/science/${article.slug}`} className="group block mb-12">
                <div className="relative h-[400px] bg-gray-900 rounded-xl mb-6 overflow-hidden border border-gray-200">
                  {article.thumbnail?.url && (
                    <img 
                      src={article.thumbnail.url} 
                      alt={article.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" 
                      loading="lazy" 
                    />
                  )}
                  {/* CSS Heatmap representation */}
                  <div className="absolute inset-0 opacity-20 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-teal-200 via-orange-200 to-teal-500" />
                  
                  {/* Mini SVG Chart Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 p-4 flex items-end justify-between opacity-50 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent">
                    {[30, 45, 25, 60, 80, 50, 90, 70].map((val, idx) => (
                      <div key={idx} className="w-8 bg-[#008080] rounded-t-sm transition-all duration-500 group-hover:bg-[#ff7f50]" style={{ height: `${val}%` }} />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold mb-4 group-hover:text-[#008080] transition-colors leading-tight">
                  {article.title}
                </h2>
                <p className="text-lg text-gray-600 line-clamp-3">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>

          {/* Sidebar Data points */}
          <div className="md:col-span-4 space-y-8">
            {scienceArticles.slice(1, 4).map((article, i) => (
              <Link key={i} href={`/science/${article.slug}`} className="group block border-l-4 border-[#008080] pl-6 hover:border-[#ff7f50] transition-colors">
                {article.thumbnail?.url && (
                  <div className="w-full h-28 overflow-hidden rounded-md mb-2 bg-gray-100">
                    <img 
                      src={article.thumbnail.url} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff7f50] animate-ping" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Data</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#ff7f50] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.excerpt}
                </p>
              </Link>
            ))}
            
            {/* Warning Callout */}
            <div className="bg-orange-50 border border-[#ff7f50]/30 p-6 rounded-xl">
              <h4 className="text-[#ff7f50] font-bold mb-2">Climate Alert</h4>
              <p className="text-sm text-orange-800">Global temperatures have risen by 1.2°C above pre-industrial levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
