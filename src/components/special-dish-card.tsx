import Link from "next/link";
import { ChevronRight, Crown, Moon } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import type { SpecialDish } from "@/lib/data/restaurants";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A dish marked "Evening special" (Balayya Babu Biryani), as a big gold
 * card: on Home (with its kitchen's name) and on top of its kitchen's menu.
 * While it's sold out it says it's back for evening orders; once the admin
 * switches it on, "Order now" opens the menu scrolled to it.
 */
export function SpecialDishCard({ special, showKitchen = true }: { special: SpecialDish; showKitchen?: boolean }) {
  const on = special.isAvailable;
  return (
    <Link
      href={`/restaurants/${special.restaurantId}?dish=${special.dishId}`}
      transitionTypes={["nav-forward"]}
      aria-label={`${special.dishName}, evening special${showKitchen ? ` at ${special.restaurantName}` : ""}, ${formatRupees(special.price)}${on ? ", order now" : ", back for evening orders"}`}
      className="pressable glow-amber animate-shine relative mt-4 flex overflow-hidden rounded-[1.75rem] border-2 border-amber/70 bg-hero text-hero-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/80"
    >
      <div className="relative w-[42%] shrink-0 bg-stripes">
        {special.photo && (
          <BlurImage src={special.photo} alt="" sizes="180px" className="object-cover" />
        )}
        <span className="absolute top-2.5 left-2.5 flex size-8 items-center justify-center rounded-full bg-amber text-black shadow-card">
          <Crown className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1 px-4 py-4">
        <p className="flex items-center gap-1.5 text-label font-bold tracking-wide text-amber uppercase">
          <Moon className="size-3.5" aria-hidden="true" />
          Evening special
        </p>
        <p className="mt-1 font-heading text-xl leading-tight font-bold">{special.dishName}</p>
        <p className="mt-1 text-sm text-hero-foreground/80">
          {showKitchen ? `${special.restaurantName} · ` : ""}
          <span className="font-bold text-hero-foreground tabular-nums">{formatRupees(special.price)}</span>
        </p>
        <span
          className={cn(
            "mt-3 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold",
            on ? "surface-primary bg-primary text-primary-foreground" : "bg-hero-foreground/12 text-hero-foreground",
          )}
        >
          {on ? (
            <>
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="animate-ping-slow absolute inset-0 rounded-full bg-primary-foreground" />
                <span className="relative size-1.5 rounded-full bg-primary-foreground" />
              </span>
              Order now
              <ChevronRight className="size-4" aria-hidden="true" />
            </>
          ) : (
            "Back for evening orders"
          )}
        </span>
      </div>
    </Link>
  );
}
