import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32" />

          <div className="hidden items-center gap-6 md:flex">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>

          <Skeleton className="h-8 w-8 rounded-md md:hidden" />
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />

            <div className="space-y-3">
              <Skeleton className="h-12 w-full max-w-xl" />
              <Skeleton className="h-12 w-4/5 max-w-lg" />
            </div>

            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-3/4 max-w-sm" />

            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-32 rounded-md" />
              <Skeleton className="h-11 w-28 rounded-md" />
            </div>
          </div>

          {/* Hero image */}
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        </div>

        {/* Content cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border p-6"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}