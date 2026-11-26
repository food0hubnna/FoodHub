import { Gift } from "lucide-react";
import type { KitchenDeal } from "@/lib/offers";

/**
 * A kitchen's own deal on its menu page, while the admin has it on: each
 * step on its own line. The cart applies it by itself once the bag
 * qualifies, so there's nothing to tap here.
 */
export function DealBanner({ deal }: { deal: KitchenDeal }) {
  return (
    <section
      aria-label={`${deal.title} deal`}
      className="animate-shine relative mt-3 overflow-hidden rounded-[1.5rem] border border-success/40 bg-success-soft px-5 py-4"
    >
      <p className="flex items-center gap-2 font-heading text-lg font-bold text-success">
        <Gift className="size-5 shrink-0" aria-hidden="true" />
        {deal.title}
      </p>
      <ul className="mt-1.5 space-y-1 text-sm font-medium">
        {deal.tiers.map((t) => (
          <li key={t.min} className="flex gap-2">
            <span className="text-success" aria-hidden="true">
              •
            </span>
            {t.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Applied by itself in your bag once you qualify.</p>
    </section>
  );
}
