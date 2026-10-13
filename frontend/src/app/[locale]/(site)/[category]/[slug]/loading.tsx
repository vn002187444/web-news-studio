export default function ArticleLoading() {
  return (
    <div className="w-full min-h-screen bg-[#111111] p-6 pt-32 max-w-[1200px] mx-auto">
      {/* Title Skeleton */}
      <div className="w-3/4 h-16 bg-neutral-800/40 border border-white/5 animate-pulse mb-6 rounded"></div>
      
      {/* Meta Skeleton */}
      <div className="w-1/4 h-6 bg-neutral-800/40 border border-white/5 animate-pulse mb-12 rounded"></div>

      {/* Hero Image Skeleton */}
      <div className="w-full h-[50vh] bg-neutral-800/40 border border-white/5 animate-pulse rounded mb-12"></div>
      
      {/* Article Body Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Space */}
        <div className="hidden lg:block lg:col-span-3">
            <div className="w-full h-8 bg-neutral-800/40 border border-white/5 animate-pulse mb-4 rounded"></div>
            <div className="w-2/3 h-8 bg-neutral-800/40 border border-white/5 animate-pulse mb-4 rounded"></div>
            <div className="w-3/4 h-8 bg-neutral-800/40 border border-white/5 animate-pulse mb-4 rounded"></div>
        </div>

        {/* Content Space */}
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-6">
          <div className="w-full h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
          <div className="w-full h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
          <div className="w-5/6 h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
          <div className="w-full h-6 bg-neutral-800/40 border border-white/5 animate-pulse mt-6 rounded"></div>
          <div className="w-4/5 h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
          <div className="w-full h-6 bg-neutral-800/40 border border-white/5 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}
