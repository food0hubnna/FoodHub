import Link from "next/link";
import { History } from "lucide-react";
import { adminPill } from "@/components/admin/styles";
import { MarkAllDeliveredButton } from "@/components/admin/mark-all-delivered-button";
import { NewOrderAlerts } from "@/components/admin/new-order-alerts";
import { OrderBoard } from "@/components/admin/order-board";
import { OrderingKillSwitch } from "@/components/admin/ordering-kill-switch";
import { StatCards, TodayTiles } from "@/components/admin/stat-cards";
import {
  getAdminOrders,
  getAdminRestaurants,
  getConfirmedOrderTimes,
  getOrderCounts,
  getToCollect,
} from "@/lib/data/admin";
import { deliveryDue, formatShortDay, formatTime, isPastDeliverySlot, slotEndTime, startOfTodayIST } from "@/lib/date";
import { getOffers } from "@/lib/data/offers";
import { getOrderingState } from "@/lib/data/settings";
import { OFFERS } from "@/lib/offers";

/**
 * The admin's Orders tab: the Today card (next-delivery countdown + Open /
 * Closed), today's numbers, the alert switch, then the live board.
 * Delivery times are FoodHub's fixed ones (2:00 PM, 8:00 – 8:10 PM) or an
 * express kitchen's N minutes.
 */
export default async function AdminPage() {
  const [restaurants, orderCounts, ordering, orders, confirmedAll, offers, toCollect] = await Promise.all([
    getAdminRestaurants(),
    getOrderCounts(startOfTodayIST()),
    getOrderingState(),
    getAdminOrders(),
    getConfirmedOrderTimes(),
    getOffers(),
    getToCollect(),
  ]);

  const activeRestaurants = restaurants.filter((r) => r.is_active).length;

  // Counted over every confirmed order (not just today's board) — the same
  // set markAllConfirmedDelivered() acts on: delivery time already passed.
  const eligibleForDelivery = confirmedAll.filter((o) => isPastDeliverySlot(o.createdAt, undefined, o.deliveryMinutes)).length;
  const waiting = confirmedAll.filter((o) => !isPastDeliverySlot(o.createdAt, undefined, o.deliveryMinutes));
  const nextSlotEnd = waiting.length
    ? formatTime(new Date(Math.min(...waiting.map((o) => slotEndTime(o.createdAt, o.deliveryMinutes).getTime()))).toISOString())
    : null;
  const openOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const dueById = Object.fromEntries(orders.map((o) => [o.id, deliveryDue(o.createdAt, o.deliveryMinutes)]));

  return (
    <>
      <StatCards
        todayLabel={formatShortDay(new Date().toISOString())}
        openOrders={openOrders.map((o) => ({ due: dueById[o.id] }))}
        activeRestaurants={activeRestaurants}
        totalRestaurants={restaurants.length}
        offersOn={[
          ...offers.active.map((k) => OFFERS[k].short),
          ...(offers.deals.length ? [offers.deals.length === 1 ? "1 kitchen deal" : `${offers.deals.length} kitchen deals`] : []),
        ]}
      >
        <OrderingKillSwitch ordering={ordering} />
      </StatCards>

      <TodayTiles
        total={orderCounts.total}
        delivered={orderCounts.completed}
        cancelled={orderCounts.cancelled}
        toCollect={toCollect}
      />

      <div className="flex flex-wrap items-center gap-2">
        <NewOrderAlerts />
        <Link href="/admin/history" className={adminPill}>
          <History className="size-4" aria-hidden="true" />
          Order history
        </Link>
      </div>

      <OrderBoard
        orders={orders}
        dueById={dueById}
        confirmedTools={
          <MarkAllDeliveredButton
            confirmedCount={confirmedAll.length}
            eligibleCount={eligibleForDelivery}
            nextSlotEnd={nextSlotEnd}
          />
        }
      />
    </>
  );
}
