import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { HandiSays } from "@/components/handi/handi-says";
import { SectionTitle } from "@/components/handi/section-title";
import { ActiveOrderCard, PastOrderRow } from "@/components/orders/order-cards";
import { EmptyState } from "@/components/empty-state";
import { getUploadedPhotos } from "@/lib/data/uploaded-photos";
import { getOrderHistory, type OrderSummary } from "@/lib/data/orders";
import { formatDayHeading, istDayKey } from "@/lib/date";
import { NAV_TRANSITION, REVEAL_ENTER } from "@/lib/nav-transition";
import { isActiveStatus } from "@/lib/orders/status";
import { requireProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Your orders · FoodHub", robots: { index: false, follow: false } };

/*
 * Orders still on their way are pinned in an "In progress" section with a
 * their delivery time; everything else is grouped by IST day ("Today",
 * "Yesterday", "Wed 17 Sep") as compact rows inside one card per day, so a
 * long history reads as a timeline instead of 30 identical cards that all
 * say "Today,".
 */
export default async function OrdersPage() {
  const profile = await requireProfile();
  // Uploaded photos registered before getDishPhoto() runs below.
  const [orders] = await Promise.all([getOrderHistory(profile.id), getUploadedPhotos()]);

  const inProgress = orders.filter((o) => isActiveStatus(o.status));
  const past = orders.filter((o) => !isActiveStatus(o.status));
  const days: { key: string; heading: string; orders: OrderSummary[] }[] = [];
  for (const order of past) {
    const key = istDayKey(order.createdAt);
    const day = days.at(-1);
    if (day?.key === key) day.orders.push(order);
    else days.push({ key, heading: formatDayHeading(order.createdAt), orders: [order] });
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6 pb-28">
      <ViewTransition {...NAV_TRANSITION}>
        <ViewTransition {...REVEAL_ENTER}>
          <HandiSays pose="happy">
            <h1 className="font-heading text-title leading-tight font-bold">Your orders</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {orders.length === 0
                ? "Nothing yet. I'm waiting!"
                : `${orders.length} ${orders.length === 1 ? "craving" : "cravings"} so far, all at the gate.`}
            </p>
          </HandiSays>

          {orders.length === 0 && <EmptyOrders />}

          {inProgress.length > 0 && (
            <section aria-labelledby="in-progress" className="mt-6">
              <SectionTitle id="in-progress">Coming up</SectionTitle>
              <ul className="mt-7 flex flex-col gap-8">
                {inProgress.map((order) => (
                  <li key={order.id}>
                    <ActiveOrderCard order={order} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {days.map((day) => (
            <section key={day.key} aria-labelledby={`day-${day.key}`} className="mt-7">
              <SectionTitle id={`day-${day.key}`} aside={`${day.orders.length} ${day.orders.length === 1 ? "order" : "orders"}`}>
                {day.heading}
              </SectionTitle>
              <ul className="paper mt-2 divide-y divide-dashed border bg-card shadow-card">
                {day.orders.map((order) => (
                  <PastOrderRow key={order.id} order={order} />
                ))}
              </ul>
            </section>
          ))}
        </ViewTransition>
      </ViewTransition>

    </main>
  );
}

function EmptyOrders() {
  return (
    <EmptyState
      art="handi"
      title="No orders yet"
      action={
        <Link
          href="/"
          className="pressable surface-primary glow-amber flex h-14 items-center rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground outline-none hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring/80"
        >
          Order something
        </Link>
      }
    >
      Your first order shows up right here.
    </EmptyState>
  );
}
