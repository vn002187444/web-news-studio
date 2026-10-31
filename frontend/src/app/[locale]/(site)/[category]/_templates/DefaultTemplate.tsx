export default function DefaultTemplate({ category, articles }: { category: string, articles?: any[] }) {
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-4xl sm:text-6xl font-serif uppercase tracking-tighter break-words">{category}</h1>
      </div>
    </div>
  );
}
