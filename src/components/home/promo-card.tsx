import Image from "next/image";
import { Clock } from "lucide-react";

/**
 * Home's promo card, shown while ordering is open (when it's closed, the
 * "Ordering is closed" banner takes this spot): the pitch and the real
 * delivery time an order placed now gets (deliveryWindow(), passed in from
 * the server so it can't disagree with the ticket), beside a biryani.
 */
export function PromoCard({ slot }: { slot: { lead: string; time: string } }) {
  return (
    <section
      aria-label="Hot food, at Main Gate"
      className="surface-hero glow-hero relative mt-6 min-h-[11.5rem] overflow-hidden rounded-[1.75rem] bg-hero p-5 text-hero-foreground"
    >
      <Image
        src="/menu/dishes/chicken-dum-biryani.jpg"
        alt=""
        width={224}
        height={224}
        sizes="176px"
        className="absolute -right-10 -bottom-12 size-44 rounded-full object-cover ring-4 ring-hero-accent/40"
      />
      <div className="relative z-10 max-w-[60%]">
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
