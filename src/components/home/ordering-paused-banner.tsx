import { RandomAnimation } from "@/components/random-animation";
import type { OrderingState } from "@/lib/ordering";

/**
 * Shown on Home whenever students can't order (the admin's Open / Closed
 * switch is on Closed), over Handi asleep for the night. Wording from
 * describeOrdering().
 */
export function OrderingPausedBanner({ ordering }: { ordering: OrderingState }) {
  return (
    <div className="surface-hero paper relative mt-6 min-h-[12.5rem] overflow-hidden bg-hero p-5 text-hero-foreground">
      <RandomAnimation
        set="closed"
        sizes="(max-width: 448px) 100vw, 448px"
        className="absolute! inset-0"
        mediaClassName="object-right"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-3/5 bg-linear-to-r from-hero via-hero/75 to-transparent"
      />
      <div className="relative z-10 max-w-[58%]">
        <p className="font-heading text-lg leading-tight font-bold">{ordering.headline}</p>
        <p className="mt-1.5 text-sm text-hero-foreground/85">{ordering.detail}</p>
      </div>
    </div>
  );
}
