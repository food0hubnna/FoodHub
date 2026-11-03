import { ViewTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { REVEAL_EXIT } from "@/lib/nav-transition";

// Mirrors restaurants/[id]/page.tsx's layout (arched kitchen window with its
// sign, sticky filter row, arched dish cards) so nothing jumps once the real
// menu replaces it.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-md px-6 pt-4" aria-busy="true">
      <span className="sr-only">Loading menu…</span>

      <ViewTransition {...REVEAL_EXIT}>
        <div className="arch-card border bg-card p-2">
          <Skeleton className="arch h-64" />
          <div className="flex flex-col items-center px-3 pt-3 pb-3">
            <Skeleton className="h-8 w-1/2 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-6 h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-hidden py-2.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full" />
        </div>

        <Skeleton className="mt-7 h-7 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="arch-card-sm border bg-card p-1.5 pb-2.5">
              <Skeleton className="arch-sm aspect-square w-full" />
              <Skeleton className="mt-2.5 h-4 w-4/5" />
              <Skeleton className="mt-2 h-5 w-14" />
            </div>
          ))}
        </div>
      </ViewTransition>
    </main>
  );
}
