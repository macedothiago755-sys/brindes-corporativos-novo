export default function Loading() {
  return (
    <div className="container-premium py-16">
      <div className="mb-6 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-9 w-3/4 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
