export function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 animate-pulse">
          <div className="aspect-square bg-neutral-800 w-full" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-800 rounded w-1/2" />
            <div className="flex justify-between items-center pt-4">
              <div className="h-8 bg-neutral-800 rounded w-20" />
              <div className="h-10 bg-neutral-800 rounded-full w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}