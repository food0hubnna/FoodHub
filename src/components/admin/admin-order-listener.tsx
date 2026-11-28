"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { armAdminAlertSound, playAdminAlertSound } from "@/lib/sound/play";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast/store";

/** Fired on window for each new order; the Orders tab counts them. */
export const NEW_ORDER_EVENT = "foodhub:new-order";

/**
 * Mounted once in the admin layout, so every tab (Orders, Kitchen,
 * Analytics, More) hears new orders, not only the Orders page.
 *
 * - Plays the loud alert (unless muted). Browsers only allow sound after a
 *   tap, so the first tap anywhere in admin arms it by itself.
 * - While the admin app is open in the background, also shows a system
 *   notification (if notifications are allowed), which buzzes the phone.
 * - Refreshes the page so the new order shows up.
 */
export function AdminOrderListener() {
  const router = useRouter();

  useEffect(() => {
    const arm = () => armAdminAlertSound();
    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", arm);
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        playAdminAlertSound();
        window.dispatchEvent(new Event(NEW_ORDER_EVENT));
        toast.success("New order just came in.");
        if (document.visibilityState === "hidden") void showSystemNotification(String(payload.new?.id ?? ""));
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}

async function showSystemNotification(orderId: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const registration = await navigator.serviceWorker?.getRegistration();
    const options = {
      body: "Open FoodHub Admin to confirm it.",
      // Same tag as the server push, so the phone shows one, not two.
      tag: orderId ? `order-${orderId}` : "new-order",
      requireInteraction: true,
      data: { url: "/admin" },
    };
    if (registration) await registration.showNotification("New order on FoodHub", options);
    else new Notification("New order on FoodHub", options);
  } catch {
    // The sound and the toast still happened.
  }
}
