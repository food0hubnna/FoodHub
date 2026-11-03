import { Clock } from "lucide-react";
import { RandomAnimation } from "@/components/random-animation";

/**
 * Home's promo card, shown while ordering is open (when it's closed, the
 * "Ordering is closed" banner takes this spot): the pitch and the real
 * delivery time an order placed now gets (deliveryWindow(), passed in from
 * the server so it can't disagree with the ticket), over a random Handi scene.
 * The scenes keep their action on the right; the scrim holds the copy's contrast.
 */
export function PromoCard({ slot }: { slot: { lead: string; time: string } }) {
  return (
    <section
      aria-label="Hot food, at Main Gate"
      className="surface-hero glow-hero relative mt-6 min-h-[12.5rem] overflow-hidden rounded-[1.75rem] bg-hero p-5 text-hero-foreground"
    >
      <RandomAnimation
        set="banner"
        sizes="(max-width: 448px) 100vw, 448px"
        className="absolute! inset-0"
        mediaClassName="object-right"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-3/5 bg-linear-to-r from-hero via-hero/75 to-transparent"
      />
      <div className="relative z-10 max-w-[58%]">
        <h2 className="font-heading text-title leading-tight font-bold">Hot food, at Main&nbsp;Gate</h2>
        <p className="mt-1 text-sm text-hero-foreground/85">Order here, pay when you collect.</p>
        <p className="mt-2.5 flex items-start gap-1.5 text-sm font-semibold">
          <Clock className="mt-0.5 size-4 shrink-0 text-hero-accent" aria-hidden="true" />
          <span>
            {slot.lead} <span className="text-hero-accent">{slot.time}</span>
          </span>
        </p>
      </div>
    </section>
  );
}
