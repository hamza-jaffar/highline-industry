export default function ProductLoading() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#fafafa] animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image Skeleton */}
            <div className="w-full aspect-[4/5] bg-black/5 rounded-2xl" />
            
            {/* Thumbnail Skeletons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-black/5 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:py-8 space-y-10">
            {/* Header / Price Skeletons */}
            <div className="space-y-4 border-b border-black/5 pb-8">
              <div className="h-4 w-32 bg-black/5 rounded" />
              <div className="h-10 w-3/4 bg-black/10 rounded" />
              <div className="h-8 w-24 bg-black/5 rounded" />
            </div>

            {/* Description Skeletons */}
            <div className="space-y-3 pb-8 border-b border-black/5">
              <div className="h-4 w-full bg-black/5 rounded" />
              <div className="h-4 w-5/6 bg-black/5 rounded" />
              <div className="h-4 w-4/6 bg-black/5 rounded" />
              <div className="h-4 w-full bg-black/5 rounded" />
            </div>

            {/* Selector Skeletons */}
            <div className="space-y-8 pb-8">
              <div className="space-y-4">
                <div className="h-4 w-16 bg-black/5 rounded" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-16 bg-black/5 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Add to Cart Button Skeleton */}
              <div className="h-14 w-full bg-black/10 rounded-xl" />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
