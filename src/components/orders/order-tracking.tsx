"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, MapPin, Share2 } from "lucide-react";
import { HandiSticker } from "@/components/handi/handi-says";
import { HangingSign } from "@/components/handi/hanging-sign";
import { SectionTitle } from "@/components/handi/section-title";
import { BlurImage } from "@/components/blur-image";
import { CelebrationOverlay } from "@/components/celebration-overlay";
import { NotifyMeCard } from "@/components/notifications/notify-me-card";
import { RandomAnimation } from "@/components/random-animation";
import { RateOrder } from "@/components/orders/rate-order";
import { SupportButtons } from "@/components/support-buttons";
import type { OrderDetail } from "@/lib/data/orders";
import type { OrderStatus } from "@/lib/data/types";
import { deliveryWindow, formatTime } from "@/lib/date";
import { getDishPhoto } from "@/lib/data/dish-photos";
import { formatRupees } from "@/lib/format";
import { NAV_TRANSITION } from "@/lib/nav-transition";
import { formatOrderNumber } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast/store";
import { cn } from "@/lib/utils";
import { orderLine } from "@/lib/handi/lines";
import { OFFERS } from "@/lib/offers";

/** Native share sheet when available (mostly mobile); clipboard copy otherwise. */
async function shareOrderToken(token: string) {
  const text = `My FoodHub order token: ${token}`;
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // Cancelled, or unsupported despite the feature check — fall through to copying.
    }
  }
  try {
    await navigator.clipboard.writeText(token);
    toast.success("Token copied!");
  } catch {
    toast.error("Couldn't copy — try selecting it manually.");
  }
}

// Confetti plays once ever, on whichever order happens to be the first
// this device sees placed — remembered locally, not tied to the account,
// so it survives across restaurants/orders but not across devices.
const CONFETTI_SHOWN_KEY = "foodhub.confetti-shown";

/**
 * Renders the order page. Delivery times aren't constant, so a student sees
 * only the promised time, never a kitchen stage or a progress line. `status`
 * stays live via Supabase Realtime (subscribed to just this order's row — RLS
 * still governs whether this client is even allowed to receive it) so the tick
 * and the rating card appear the moment an admin marks it delivered.
 *
 * Falls back cleanly if Realtime never connects or the tab was in the
 * background: `initialOrder` came from the server component's own fetch,
 * so a plain page refresh always shows the true current status.
 */
export function OrderTracking({
  initialOrder,
  justPlaced = false,
  openRating = false,
}: {
  initialOrder: OrderDetail;
  /** True once, right after this order was placed — shows a brief success moment. */
  justPlaced?: boolean;
  /** ?rate=1 — open the rating sheet on arrival (if the order is rateable). */
  openRating?: boolean;
}) {
  const router = useRouter();
  // Captured once, on mount — not the live `justPlaced` prop. The effect
  // below calls router.replace() to strip ?placed=1, which (this route
  // reads searchParams, so it's dynamically rendered) triggers a fresh
  // server render with justPlaced now false. If the effect depended on
  // the live prop instead, that re-render would unmount the success
  // overlay mid-moment.
  const [showSuccess] = useState(justPlaced);
  const [status, setStatus] = useState(initialOrder.status);
  const [deliveredAt, setDeliveredAt] = useState(initialOrder.deliveredAt);

  useEffect(() => {
    // Strip ?placed=1 right away so a refresh doesn't replay the moment.
    if (showSuccess) router.replace(`/orders/${initialOrder.id}`);
  }, [initialOrder.id, showSuccess, router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on<{ status: OrderStatus; delivered_at: string | null }>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${initialOrder.id}` },
        (payload) => {
          setStatus(payload.new.status);
          setDeliveredAt(payload.new.delivered_at);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialOrder.id]);

  const cancelled = status === "cancelled";
  const delivered = status === "delivered";
  const eta = deliveryWindow(initialOrder.createdAt);
  return (
    <>
      {showSuccess && (
        <CelebrationOverlay confettiOnceKey={CONFETTI_SHOWN_KEY}>
          <HandiSticker pose="excited" sizes="176px" preload className="animate-pop-in size-44" />
          <p className="animate-pop-in mt-5 font-heading text-2xl font-bold">Order placed!</p>
          <p className="mt-1 text-hero-foreground/85">Show this token at the gate</p>
          <p className="animate-pop-in mt-4 font-heading text-7xl font-bold tracking-tight text-hero-accent">
            {formatOrderNumber(initialOrder.dailyNumber)}
          </p>
        </CelebrationOverlay>
      )}
      <main className="mx-auto w-full max-w-md px-6 pb-12">
        <ViewTransition {...NAV_TRANSITION}>
          <div className="flex items-center gap-3 pt-4 pb-2">
            <Link
              href="/orders"
              aria-label="Back to your orders"
              transitionTypes={["nav-back"]}
              className="flex size-11 items-center justify-center rounded-full border bg-card shadow-card outline-none hover:border-ring/50 focus-visible:ring-3 focus-visible:ring-ring/80"
            >
              <ArrowLeft className="size-5" />
            </Link>
          </div>

          {/* Handi's promise: the same arched window as a kitchen on Home, with
              Handi in it, the state of things on its sign and the promised
              time under it. Nothing here moves with the order's progress. */}
          <section aria-live="polite" className="arch-card glow-hero border bg-card p-2 text-center">
            <div className={cn("arch surface-hero relative h-64 overflow-hidden bg-hero ring-2 ring-amber/60", cancelled && "grayscale")}>
              {cancelled ? (
                <HandiSticker pose="side" sizes="176px" className="absolute! inset-0 m-auto size-44" />
              ) : (
                <RandomAnimation
                  key={delivered ? "delivered" : "order"}
                  set={delivered ? "delivered" : "order"}
                  sizes="(min-width: 448px) 400px, 90vw"
                  className="size-full"
                  mediaClassName={delivered ? "object-[50%_22%]" : "object-[50%_78%]"}
                />
              )}
            </div>
            <HangingSign>{cancelled ? "Order cancelled" : delivered ? "Delivered. Enjoy!" : "Handi's promise"}</HangingSign>
            <div className="px-4 pt-3 pb-4">
              {!cancelled && !delivered && (
                <p>
                  <span className="block text-sm text-muted-foreground">
                    {eta.lead === "Delivery by" ? "Your food will be delivered by" : eta.lead}
                  </span>
                  <span className="block font-heading text-headline font-bold text-primary">{eta.time}</span>
                </p>
              )}
              <p className={cn("text-sm text-muted-foreground", !cancelled && !delivered && "mt-1")}>{orderLine(status)}</p>
            </div>
          </section>

          {/* The token, as a luggage tag tied to the order. */}
          <section className="paper surface-hero glow-hero relative mt-5 -rotate-1 bg-hero p-5 pl-11 text-hero-foreground">
            <span aria-hidden="true" className="absolute top-1/2 left-4 size-4 -translate-y-1/2 rounded-full bg-background ring-2 ring-hero-accent/70" />
            <h1 className="sr-only">
              Order {formatOrderNumber(initialOrder.dailyNumber)} from {initialOrder.restaurantName}
            </h1>
            <p className="text-label text-hero-accent">{cancelled || delivered ? "Order token" : "Show this at the gate"}</p>
            <div className="mt-0.5 flex items-center gap-3">
              <p className={cn("font-heading text-6xl leading-none font-bold", cancelled && "line-through opacity-60")}>
                {formatOrderNumber(initialOrder.dailyNumber)}
              </p>
              <button
                type="button"
                onClick={() => shareOrderToken(formatOrderNumber(initialOrder.dailyNumber))}
                aria-label="Share order token"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hero-foreground/10 outline-none hover:bg-hero-foreground/20 focus-visible:ring-2 focus-visible:ring-hero-foreground"
              >
                <Share2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 truncate text-sm text-hero-foreground/85">
              {initialOrder.restaurantName} · {formatTime(initialOrder.createdAt)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4 shrink-0 text-hero-accent" aria-hidden="true" />
              <span>
                <strong className="font-semibold">VIT-AP Main Gate</strong> · pay on delivery
              </span>
            </p>
          </section>

          {/* Still on its way: offer notifications instead of watching this page. */}
          {!cancelled && !delivered && <NotifyMeCard />}

          {/* Appears live the moment admin marks it delivered (status comes
              from the Realtime subscription above). */}
          {delivered && (
            <RateOrder
              orderId={initialOrder.id}
              restaurantName={initialOrder.restaurantName}
              items={initialOrder.items}
              deliveredAt={deliveredAt}
              initialReview={initialOrder.review}
              autoOpen={openRating}
            />
          )}

          <div className="mt-7 drop-shadow-sm">
          <div className="receipt bg-card p-5">
            <SectionTitle>What&apos;s in the bag</SectionTitle>
            <ul className="mt-2 divide-y divide-dashed">
              {initialOrder.items.map((item) => {
                const photo = getDishPhoto(initialOrder.restaurantName, item.dishName);
                return (
                  <li key={item.id} className="flex items-center gap-3 py-2.5">
                    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-heading font-bold text-brand-soft-foreground/60 ring-1 ring-amber/70">
                      {photo ? (
                        <BlurImage src={photo} alt="" sizes="44px" className="object-cover" />
                      ) : (
                        <span aria-hidden="true">{item.dishName.trim().charAt(0)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold tabular-nums">{item.quantity} ×</span> {item.dishName}
                      {item.extras.length > 0 && (
                        <span className="block text-muted-foreground">+ {item.extras.join(", ")}</span>
                      )}
                    </span>
                    {item.isFree ? (
                      <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-sm font-semibold text-success">Free</span>
                    ) : (
                      <span className="text-sm tabular-nums">{formatRupees(item.subtotal)}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            {initialOrder.discountOffer && (
              <div className="mt-1 flex items-center justify-between gap-3 border-t pt-3 text-sm font-semibold text-success">
                <span>{OFFERS[initialOrder.discountOffer].short}</span>
                <span className="tabular-nums">−{formatRupees(initialOrder.discountAmount)}</span>
              </div>
            )}
            {initialOrder.notes && (
              <p className="mt-3 rounded-xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                “{initialOrder.notes}”
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-dashed pt-3">
              <p className="font-semibold">To pay at pickup</p>
              <p className="font-heading text-xl font-bold text-primary tabular-nums">{formatRupees(initialOrder.totalAmount)}</p>
            </div>
          </div>
          </div>

          <div className="paper mt-4 flex items-center gap-2 border bg-card py-2 pr-4 pl-2 shadow-card">
            <HandiSticker pose="side" sizes="56px" className="size-14" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Something wrong?</p>
              <p className="font-semibold">Contact FoodHub</p>
            </div>
            <SupportButtons
              whatsappMessage={`Hi FoodHub, something's wrong with my order ${formatOrderNumber(initialOrder.dailyNumber)}.`}
            />
          </div>
        </ViewTransition>
      </main>
    </>
  );
}
