"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HandiSticker } from "@/components/handi/handi-says";
import { cartTotals, useCart } from "@/lib/cart/store";
import { formatRupees } from "@/lib/format";
import { bagLine } from "@/lib/handi/lines";
import { cn } from "@/lib/utils";
import type { OffersState } from "@/lib/offers";
import { CartSheet } from "./cart-sheet";

/**
 * Floating bar with Handi on it, a line about what's in the bag, the total and
 * "View bag", plus the sheet it opens. Handi hops whenever something's added.
 * Hidden while the cart is empty (the sheet stays open if you empty it).
 */
export function CartBar({
  profilePhone,
  currentRestaurantId,
  orderingEnabled,
  closedNote,
  spiceLevel = null,
  offers,
  hasTabBar = false,
}: {
  profilePhone: string;
  /** On a menu page: names the cart's restaurant when it's a different one. */
  currentRestaurantId?: string;
  /** Campus-wide kill switch — disables checkout in the cart sheet when off. */
  orderingEnabled: boolean;
  /** Why ordering is shut ("Ordering opens again at 1:30 PM"), shown in the cart sheet. */
  closedNote?: string;
  /** The taste profile's spice answer — offers a one-tap spice note in the cart. */
  spiceLevel?: number | null;
  /** Discount offers the admin has on (getOffers()) — the cart's "Apply discount" bar. */
  offers?: OffersState;
  /** True on pages where the floating <TabBar/> shows (Home) — stacks the bar above it. */
  hasTabBar?: boolean;
}) {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const totals = cartTotals(cart);
  const cartIsElsewhere = cart.restaurantId !== null && cart.restaurantId !== currentRestaurantId;

  return (
    <>
      {totals.items > 0 && (
        <>
          {/* Spacer so page content isn't hidden behind the bar. */}
          <div className="h-28" aria-hidden="true" />
          <div
            className={cn(
              "animate-slide-up-in fixed inset-x-0 z-20 mx-auto w-full max-w-md px-4",
              hasTabBar ? "bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+6rem)] pb-0" : "bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
            )}
          >
            <div className="surface-hero glow-hero relative flex items-center gap-2 rounded-[1.5rem] bg-hero p-2 pl-[4.25rem] text-hero-foreground">
              <span key={totals.items} aria-hidden="true" className="animate-handi-hop absolute bottom-1 left-1">
                <HandiSticker pose="excited" sizes="64px" className="size-16 drop-shadow-[0_3px_5px_rgb(0_0_0/0.35)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-hero-foreground/85">
                  {cartIsElsewhere ? `${totals.items} from ${cart.restaurantName}` : bagLine(totals.items)}
                </p>
                <p key={totals.amount} className="animate-bounce-count font-heading text-2xl leading-tight font-bold">
                  {formatRupees(totals.amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="surface-primary glow-amber flex h-13 shrink-0 items-center gap-1.5 rounded-[1.1rem] bg-primary px-4 text-base font-bold text-primary-foreground outline-none hover:brightness-110 focus-visible:ring-3 focus-visible:ring-hero-foreground/80"
              >
                View bag <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        </>
      )}
      <CartSheet
        open={open}
        onOpenChange={setOpen}
        profilePhone={profilePhone}
        orderingEnabled={orderingEnabled}
        closedNote={closedNote}
        spiceLevel={spiceLevel}
        offers={offers}
      />
    </>
  );
}
