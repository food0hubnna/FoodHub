"use client";

import { useState } from "react";
import { ArrowRight, Gift } from "lucide-react";
import { ConfettiBurst } from "@/components/orders/confetti-burst";
import { HandiSticker } from "@/components/handi/handi-says";
import { cartTotals, useCart } from "@/lib/cart/store";
import { formatRupees } from "@/lib/format";
import { bagLine } from "@/lib/handi/lines";
import { cn } from "@/lib/utils";
import { dealResult, formatDealReward, type OffersState } from "@/lib/offers";
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

  // The bag's kitchen deal: a nudge while it's close, and a "Deal unlocked"
  // pop-up (with confetti) each time the bag reaches a new step.
  const deal = offers?.deals.find((d) => d.restaurantId === cart.restaurantId) ?? null;
  const dealNow = deal ? dealResult(deal, cart.lines) : null;
  const level = dealNow ? (dealNow.giftTier?.min ?? 0) * 1000 + dealNow.off : 0;
  const [prevLevel, setPrevLevel] = useState(level);
  const [unlocked, setUnlocked] = useState<{ key: number; text: string } | null>(null);
  if (level !== prevLevel) {
    setPrevLevel(level);
    if (level > prevLevel && deal && dealNow) {
      const gifts = dealNow.giftTier?.gifts ?? [];
      setUnlocked({
        key: level,
        text:
          gifts.length > 0
            ? `Free ${gifts.length > 1 ? "gift" : gifts[0].name} unlocked!`
            : `Deal unlocked! You save ₹${dealNow.off}`,
      });
    }
  }
  const nudge =
    deal && dealNow?.next && dealNow.count > 0 && !cartIsElsewhere
      ? `${dealNow.next.more} more ${dealNow.next.more === 1 ? deal.unit : deal.units} for ${formatDealReward(dealNow.next.tier)}`
      : null;

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
            {unlocked && (
              <div
                key={unlocked.key}
                role="status"
                className="deal-pill pointer-events-none absolute inset-x-4 -top-14 flex justify-center motion-reduce:hidden"
                onAnimationEnd={(e) => e.target === e.currentTarget && setUnlocked(null)}
              >
                <div className="relative overflow-visible">
                  <div className="absolute -inset-x-10 -top-10 h-44">
                    <ConfettiBurst />
                  </div>
                  <p className="surface-primary glow-amber relative flex items-center gap-2 rounded-full bg-success px-4 py-2 font-bold text-success-foreground shadow-card">
                    <Gift className="offer-stamp size-5" aria-hidden="true" />
                    {unlocked.text}
                  </p>
                </div>
              </div>
            )}
            <div className="surface-hero glow-hero relative flex items-center gap-2 rounded-[1.5rem] bg-hero p-2 pl-[4.25rem] text-hero-foreground">
              <span key={totals.items} aria-hidden="true" className="animate-handi-hop absolute bottom-1 left-1">
                <HandiSticker pose="excited" sizes="64px" className="size-16 drop-shadow-[0_3px_5px_rgb(0_0_0/0.35)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-hero-foreground/85">
                  {cartIsElsewhere ? `${totals.items} from ${cart.restaurantName}` : (nudge ?? bagLine(totals.items))}
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
