"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent } from "lucide-react";
import { Switch } from "@/components/admin/offers-card";
import { IconTile } from "@/components/icon-tile";
import { setPriceOfferEnabled } from "@/lib/admin/actions";
import type { PriceOffer } from "@/lib/data/offers";
import { formatRupees } from "@/lib/format";
import { toast } from "@/lib/toast/store";

/**
 * /admin/offers: one switch per flat-price offer. On sets its dishes to the
 * offer price (old price shown struck through); off puts the old prices back.
 */
export function PriceOffersCard({ offers }: { offers: PriceOffer[] }) {
  const router = useRouter();
  const [on, setOn] = useState(() => new Set(offers.filter((o) => o.isOn).map((o) => o.id)));
  const sync = offers.map((o) => `${o.id}:${o.isOn}`).join();
  const [prevSync, setPrevSync] = useState(sync);
  if (sync !== prevSync) {
    setPrevSync(sync);
    setOn(new Set(offers.filter((o) => o.isOn).map((o) => o.id)));
  }
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const [, startTransition] = useTransition();

  function toggle(offer: PriceOffer) {
    const next = !on.has(offer.id);
    const flip = (s: Set<string>, add: boolean) => {
      const copy = new Set(s);
      if (add) copy.add(offer.id);
      else copy.delete(offer.id);
      return copy;
    };
    setOn((s) => flip(s, next));
    setPending((p) => flip(p, true));
    startTransition(async () => {
      const result = await setPriceOfferEnabled(offer.id, next);
      setPending((p) => flip(p, false));
      if (result.ok) {
        toast.success(`${offer.title} is ${next ? "on" : "off"}.`);
        router.refresh();
      } else {
        setOn((s) => flip(s, !next));
        toast.error(result.error);
      }
    });
  }

  if (offers.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-title font-bold">Price offers</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        On sets these dishes to the offer price. Off puts their old prices back.
      </p>
      <ul className="mt-3 divide-y overflow-hidden rounded-[1.5rem] border bg-card shadow-card">
        {offers.map((o) => {
          const labelId = `price-offer-${o.id}`;
          return (
            <li key={o.id} className="flex items-start gap-3.5 px-5 py-4">
              <IconTile>
                <BadgePercent className="size-5" aria-hidden="true" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p id={labelId} className="font-semibold">
                  {o.restaurantName}: {formatRupees(o.price)} each
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{o.dishNames.join(" · ")}</p>
              </div>
              <Switch
                checked={on.has(o.id)}
                labelledBy={labelId}
                disabled={pending.has(o.id)}
                onClick={() => toggle(o)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
