export default function ShopLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 mt-12">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-black/10 rounded-md" />
          <div className="h-4 w-64 bg-black/5 rounded-md" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-black/5 rounded-md" />
          <div className="h-10 w-32 bg-black/5 rounded-md" />
        </div>
      </div>

      {/* Categories Desktop & Mobile */}
      <div className="flex pb-4 mb-8 gap-2 border-b border-black/5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-black/5 rounded-full" />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="group block space-y-4">
            <div className="relative aspect-[4/5] bg-black/5 border border-black/5 rounded-xl" />
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-black/5 rounded" />
                <div className="h-4 w-3/4 bg-black/10 rounded" />
              </div>
              <div className="h-4 w-12 bg-black/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
