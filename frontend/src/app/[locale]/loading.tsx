export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#111111] p-6 pt-32 max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Hero Skeleton */}
      <div className="col-span-1 md:col-span-12 h-[50vh] bg-neutral-800/40 border border-white/5 animate-pulse rounded mb-8"></div>
      
      {/* Bento Grid Skeleton */}
      <div className="col-span-1 md:col-span-8 grid grid-cols-2 gap-4">
        <div className="col-span-2 h-[300px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
        <div className="col-span-1 h-[200px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
        <div className="col-span-1 h-[200px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
      </div>
      
      {/* Sidebar Skeleton */}
      <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
        <div className="h-[100px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
        <div className="h-[100px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
        <div className="h-[100px] bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
      </div>
    </div>
  );
}
