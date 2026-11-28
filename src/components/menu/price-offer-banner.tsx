import { BadgePercent } from "lucide-react";
import type { PriceOffer } from "@/lib/data/offers";
import { formatRupees } from "@/lib/format";

/**
 * A flat-price offer on its kitchen's menu while the admin has it on. The
 * dishes are already priced at the offer price, so there's nothing to tap.
 */
export function PriceOfferBanner({ offer }: { offer: PriceOffer }) {
  return (
    <section
      aria-label={`${offer.title} offer`}
      className="animate-shine relative mt-3 overflow-hidden rounded-[1.5rem] border border-success/40 bg-success-soft px-5 py-4"
    >
      <p className="flex items-center gap-2 font-heading text-lg font-bold text-success">
        <BadgePercent className="size-5 shrink-0" aria-hidden="true" />
        Today: any of these for {formatRupees(offer.price)}
      </p>
      <p className="mt-1 text-sm font-medium">{offer.dishNames.join(" · ")}</p>
      <p className="mt-2 text-xs text-muted-foreground">Already priced in the menu. Limited time.</p>
    </section>
  );
}
