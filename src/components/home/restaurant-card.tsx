import Link from "next/link";
import { HangingSign } from "@/components/handi/hanging-sign";
import type { CardSlide } from "@/lib/data/dish-photos";
import type { RestaurantMenuStats } from "@/lib/data/restaurants";
import type { Restaurant } from "@/lib/data/types";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RestaurantPhotoSlides } from "./restaurant-photo-slides";

/*
 * A kitchen on Home: an arched window onto its dishes, sliding past on their
 * own (RestaurantPhotoSlides), with the name on a sign hanging across the
 * window's foot. Under it: what it serves, the dish count and starting price,
 * and "Step inside". Free delivery is campus-wide, so it's said once above the
 * list, not on every card. No star ratings: reviews are admin-only.
 */
export function RestaurantCard({
  restaurant,
  orderingEnabled,
  closedChip = "Closed",
  closedLine = "Ordering is closed right now",
  stats,
  slides,
  slideDelay,
  eager = false,
}: {
  restaurant: Restaurant;
  orderingEnabled: boolean;
  closedChip?: string;
  closedLine?: string;
  stats?: RestaurantMenuStats;
  /** getRestaurantCardSlides() — cover, then dish photos. */
  slides: CardSlide[];
  slideDelay?: number;
  /** The first card on Home: its cover is on screen at load, so load it now, at high priority. */
  eager?: boolean;
}) {
  const active = restaurant.is_active;
  // Fully orderable only when both this restaurant and the campus-wide
  // switch say yes. "paused" (active but the switch is off) gets its own
  // tag rather than being lumped in with "closed" — the restaurant itself
  // didn't do anything, campus ordering is just off right now.
  const open = active && orderingEnabled;
  const paused = active && !orderingEnabled;

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      transitionTypes={["nav-forward"]}
      className="arch-card pressable group block border bg-card p-2 shadow-card outline-none hover:-translate-y-0.5 hover:shadow-raised focus-visible:ring-3 focus-visible:ring-ring/80"
    >
      <div className={cn("arch h-56 overflow-hidden ring-2 ring-amber/60", !active && "opacity-60 grayscale")}>
        <RestaurantPhotoSlides
          slides={slides}
          restaurantHref={`/restaurants/${restaurant.id}`}
          autoplay={active}
          startDelay={slideDelay}
          eager={eager}
        >
          <span
            className={cn(
              "pointer-events-none absolute top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
              open ? "text-success" : "text-muted-foreground",
            )}
          >
            <span className="relative flex size-1.5" aria-hidden="true">
              {open && <span className="animate-ping-slow absolute inset-0 rounded-full bg-success" />}
              <span className={cn("relative size-1.5 rounded-full", open ? "bg-success" : "bg-muted-foreground")} />
            </span>
            {!active ? "Closed" : paused ? closedChip : "Open"}
          </span>
        </RestaurantPhotoSlides>
      </div>

      <HangingSign as="h3" className="transition-transform duration-(--dur-base) ease-spring group-hover:-rotate-1">
        {restaurant.name}
      </HangingSign>
      <div className="px-3 text-center">
        {restaurant.description && <p className="mt-2 text-sm text-muted-foreground">{restaurant.description}</p>}
        {restaurant.cuisine_tags.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-brand-soft-foreground">{restaurant.cuisine_tags.join(" · ")}</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed px-3 pt-2.5 pb-1.5 text-sm">
        {open ? (
          <>
            {stats && (
              <span className="min-w-0 text-muted-foreground">
                {stats.dishCount} {stats.dishCount === 1 ? "dish" : "dishes"} · from{" "}
                <span className="font-heading text-base font-bold text-primary">{formatRupees(stats.minPrice)}</span>
              </span>
            )}
            <span
              aria-hidden="true"
              className="surface-primary glow-amber ml-auto shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-bold text-primary-foreground transition-transform duration-(--dur-base) ease-out-expo group-hover:translate-x-0.5"
            >
              Step inside
            </span>
          </>
        ) : (
          <span className="font-semibold">
            {!active ? "Closed right now · menu still browsable" : `${closedLine} · browse the menu`}
          </span>
        )}
      </div>
    </Link>
  );
}
