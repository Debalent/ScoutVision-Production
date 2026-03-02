export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-8 w-48 rounded-lg mb-2" />
          <div className="skeleton h-4 w-64 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-24 rounded-xl" />
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-16 rounded-lg mb-2" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="skeleton h-5 w-32 rounded-lg mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48 rounded mb-1" />
                  <div className="skeleton h-3 w-72 rounded" />
                </div>
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <div className="skeleton h-5 w-28 rounded-lg mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="skeleton h-5 w-28 rounded-lg mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-2 h-2 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-32 rounded mb-1" />
                    <div className="skeleton h-3 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
