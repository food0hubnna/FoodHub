"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { Switch } from "@/components/admin/offers-card";
import { IconTile } from "@/components/icon-tile";
import { setKitchenDealEnabled } from "@/lib/admin/actions";
import type { DealTier } from "@/lib/offers";
import { toast } from "@/lib/toast/store";

type Deal = { restaurantId: string; restaurantName: string; title: string; tiers: DealTier[]; isOn: boolean };

/**
 * /admin/offers: one switch per kitchen deal (kitchen_deals.is_on). When
 * one is on, its menu shows the deal and a student's bag gets it by
 * itself once it qualifies.
 */
export function KitchenDealsCard({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [on, setOn] = useState(() => new Set(deals.filter((d) => d.isOn).map((d) => d.restaurantId)));
  // Resync when the server re-fetch changes it (another admin, another tab).
  const sync = deals.map((d) => `${d.restaurantId}:${d.isOn}`).join();
  const [prevSync, setPrevSync] = useState(sync);
  if (sync !== prevSync) {
    setPrevSync(sync);
    setOn(new Set(deals.filter((d) => d.isOn).map((d) => d.restaurantId)));
  }
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const [, startTransition] = useTransition();

  function toggle(deal: Deal) {
    const next = !on.has(deal.restaurantId);
    const flip = (s: Set<string>, add: boolean) => {
      const copy = new Set(s);
      if (add) copy.add(deal.restaurantId);
      else copy.delete(deal.restaurantId);
      return copy;
    };
    setOn((s) => flip(s, next));
    setPending((p) => flip(p, true));
    startTransition(async () => {
      const result = await setKitchenDealEnabled(deal.restaurantId, next);
      setPending((p) => flip(p, false));
      if (result.ok) {
        toast.success(`${deal.restaurantName} deal is ${next ? "on" : "off"}.`);
        router.refresh();
      } else {
        setOn((s) => flip(s, !next));
        toast.error(result.error);
      }
    });
  }

  if (deals.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-title font-bold">Kitchen deals</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Applied by themselves when a student&apos;s bag qualifies.
      </p>
      <ul className="mt-3 divide-y overflow-hidden rounded-[1.5rem] border bg-card shadow-card">
        {deals.map((d) => {
          const labelId = `deal-${d.restaurantId}`;
          return (
            <li key={d.restaurantId} className="flex items-start gap-3.5 px-5 py-4">
              <IconTile>
                <Gift className="size-5" aria-hidden="true" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p id={labelId} className="font-semibold">
                  {d.restaurantName}
                  <span className="sr-only"> deal</span>
                </p>
                <ul className="mt-0.5 space-y-0.5 text-sm text-muted-foreground">
                  {d.tiers.map((t) => (
                    <li key={t.min}>{t.label}</li>
                  ))}
                </ul>
              </div>
              <Switch
                checked={on.has(d.restaurantId)}
                labelledBy={labelId}
                disabled={pending.has(d.restaurantId)}
                onClick={() => toggle(d)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
