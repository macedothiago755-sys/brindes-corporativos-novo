export default function Loading() {
  return (
    <div className="container-premium py-16">
      <div className="h-9 w-2/3 max-w-md animate-pulse rounded-md bg-muted" />
      <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-md bg-muted" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-40 animate-pulse rounded-md bg-muted" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
