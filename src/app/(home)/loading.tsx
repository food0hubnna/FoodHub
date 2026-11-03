import { ViewTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { REVEAL_EXIT } from "@/lib/nav-transition";

// Mirrors page.tsx's layout (logo and avatar, Handi's greeting, search, the
// scene, "Hungry for?" plates, kitchen cards) so nothing jumps once the real
// data replaces it.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6 pb-28" aria-busy="true">
      <span className="sr-only">Loading kitchens…</span>

      <ViewTransition {...REVEAL_EXIT}>
        <div className="flex items-center justify-between">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="size-11 shrink-0 rounded-full" />
        </div>
        <div className="mt-5 flex items-center gap-1">
          <Skeleton className="size-24 shrink-0 rounded-full" />
          <Skeleton className="paper h-20 min-w-0 flex-1" />
        </div>

        <Skeleton className="mt-6 h-14 w-full rounded-full" />
        <Skeleton className="paper mt-6 h-50 w-full" />

        <Skeleton className="mt-7 h-7 w-40" />
        <div className="-mx-6 mt-2 flex gap-3 overflow-hidden px-6 pt-3 pb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        <Skeleton className="mt-8 h-7 w-52" />
        <div className="mt-4 flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="arch-card border bg-card p-2 shadow-card">
              <Skeleton className="arch h-56" />
              <div className="flex flex-col items-center px-3 pt-3 pb-2.5">
                <Skeleton className="h-8 w-1/2 rounded-xl" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-4 h-8 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </ViewTransition>
    </main>
  );
}
