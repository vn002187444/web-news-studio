export default function CategoryLoading() {
  return (
    <div className="w-full min-h-screen bg-[#111111] p-6 pt-32 max-w-[1600px] mx-auto">
      {/* Title Skeleton */}
      <div className="w-1/3 h-16 bg-neutral-800/40 border border-white/5 animate-pulse mb-12 rounded"></div>
      
      {/* Category Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="w-full h-64 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
            <div className="w-full h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
            <div className="w-2/3 h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
