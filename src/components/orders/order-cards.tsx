import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, RotateCcw, Star } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import { HandiSticker } from "@/components/handi/handi-says";
import { getDishPhoto } from "@/lib/data/dish-photos";
import type { OrderSummary } from "@/lib/data/orders";
import { deliveryWindow, formatDayHeading, formatTime } from "@/lib/date";
import { formatRupees } from "@/lib/format";
import { formatOrderNumber, statusBadge } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

/** First dish in the order that has a photo, if any. */
function orderPhoto(order: OrderSummary): string | undefined {
  for (const dish of order.dishNames) {
    const photo = getDishPhoto(order.restaurantName, dish);
    if (photo) return photo;
  }
}

/** The order's food on a little plate, like Home's "Hungry for?" tiles. */
function OrderPlate({ order, className }: { order: OrderSummary; className?: string }) {
  const photo = orderPhoto(order);
  return (
    <span className={cn("relative block shrink-0 rounded-full border bg-card p-1 shadow-card", className)}>
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-soft font-heading font-bold text-brand-soft-foreground/60 ring-1 ring-amber/70">
        {photo ? (
          <BlurImage src={photo} alt="" sizes="64px" className="object-cover" />
        ) : (
          <span aria-hidden="true">{order.restaurantName.trim().charAt(0)}</span>
        )}
      </span>
    </span>
  );
}

/** An order still coming: Handi with the food, the promised time and the token. */
export function ActiveOrderCard({ order }: { order: OrderSummary }) {
  const eta = deliveryWindow(order.createdAt);
  return (
    <Link
      href={`/orders/${order.id}`}
      transitionTypes={["nav-forward"]}
      className="paper pressable relative block border bg-card p-4 shadow-raised outline-none focus-visible:ring-3 focus-visible:ring-ring/80"
    >
      <HandiSticker pose="joy" sizes="72px" className="absolute! -top-6 -right-1 size-18" />
      <div className="flex items-center gap-3 pr-14">
        <OrderPlate order={order} className="size-16 text-2xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-lg leading-tight font-bold">{order.restaurantName}</p>
          <p className="truncate text-sm">{order.itemsSummary}</p>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
            {formatDayHeading(order.createdAt)}, {formatTime(order.createdAt)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed pt-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            {eta.lead} <span className="whitespace-nowrap text-primary">{eta.time}</span>
          </span>
        </p>
        <p className="shrink-0 font-heading text-lg font-bold tabular-nums">{formatRupees(order.totalAmount)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Token{" "}
          <span className="font-heading text-xl leading-none font-bold text-foreground tabular-nums">
            {formatOrderNumber(order.dailyNumber)}
          </span>
        </p>
        <span className="surface-primary flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground">
          View order <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function PastOrderRow({ order }: { order: OrderSummary }) {
  const delivered = order.status === "delivered";
  // Rateable orders open straight into the rating sheet (?rate=1).
  const href = order.rateable ? `/orders/${order.id}?rate=1` : `/orders/${order.id}`;

  return (
    <li className="flex items-center gap-2 pr-3">
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-3xl py-3.5 pl-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/80 focus-visible:ring-inset"
      >
        <OrderPlate order={order} className={cn("size-14 text-xl", !delivered && "grayscale")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-semibold">{order.restaurantName}</p>
            <p className="shrink-0 font-heading font-bold tabular-nums">{formatRupees(order.totalAmount)}</p>
          </div>
          <p className="truncate text-sm text-muted-foreground">{order.itemsSummary}</p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            <span className={cn("rounded-full px-2 py-0.5 font-semibold", statusBadge(order.status).className)}>
              {statusBadge(order.status).label}
            </span>{" "}
            · {formatTime(order.createdAt)} · {formatOrderNumber(order.dailyNumber)}
          </p>
          {order.rateable && (
            <span className="surface-primary mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground shadow-[0_4px_12px_-4px_var(--glow-amber)]">
              <Star className="size-3 fill-current" aria-hidden="true" />
              Rate your order
            </span>
          )}
        </div>
        {!delivered && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </Link>
      {delivered && (
        <Link
          href={`/restaurants/${order.restaurantId}`}
          transitionTypes={["nav-forward"]}
          aria-label={`Reorder from ${order.restaurantName}`}
          title="Reorder"
          className="pressable flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring/80"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
