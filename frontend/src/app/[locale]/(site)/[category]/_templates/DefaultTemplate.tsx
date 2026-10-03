export default function DefaultTemplate({ category, articles }: { category: string, articles?: any[] }) {
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-6xl font-serif uppercase tracking-tighter">{category}</h1>
      </div>
    </div>
  );
}
