"use client";

import { useState } from "react";
import { BadgePercent, Check, ChevronDown, Gift, Minus, Plus } from "lucide-react";
import { IconTile } from "@/components/icon-tile";
import { ConfettiBurst } from "@/components/orders/confetti-burst";
import { formatRupees } from "@/lib/format";
import { giftName, type FreeChoice, type OrderOfferKey } from "@/lib/offers";
import { cn } from "@/lib/utils";

export type OfferOption = {
  key: OrderOfferKey;
  title: string;
  detail: string;
  /** What the student saves with it right now (0 when not usable yet, or a free gift). */
  saving: number;
  /** Why it can't be used on this cart, or null when it can. */
  blocked: string | null;
};

/**
 * The cart's offers bar: shown while the admin has any offer on.
 * Collapsed it's one row (the applied offer, or a hint); opened it lists
 * the offers as a radio group — one per order, never stacked — and, for
 * the biryani offer, the single biryanis to pick free; for a kitchen
 * deal's gift step, which gift.
 *
 * The cart applies the best offer by itself; whenever the applied offer
 * changes, the card celebrates (`celebrate` = a new key each time).
 */
export function DiscountPicker({
  options,
  selected,
  onSelect,
  freeChoices,
  allowance,
  picks,
  onPick,
  gifts,
  giftIndex,
  onGift,
  hint,
  celebrate,
}: {
  options: OfferOption[];
  selected: OrderOfferKey | null;
  onSelect: (offer: OrderOfferKey | null) => void;
  /** The offer restaurant's available single biryanis. */
  freeChoices: FreeChoice[];
  /** Free singles this cart has earned. */
  allowance: number;
  /** Picked free singles, already clamped to the allowance. */
  picks: Record<string, number>;
  onPick: (dishId: string, quantity: number) => void;
  /** The kitchen deal's gifts to pick one of (empty when it isn't a gift step). */
  gifts: { name: string; quantity: number }[];
  giftIndex: number;
  onGift: (index: number) => void;
  /** Shown while nothing is applied, e.g. "Add 2 more biryanis for a free gift". */
  hint: string | null;
  /** Changes whenever an offer gets applied; null = nothing to celebrate. */
  celebrate: string | null;
}) {
  const [open, setOpen] = useState(false);
  const applied = options.find((o) => o.key === selected && !o.blocked) ?? null;
  const picked = Object.values(picks).reduce((n, q) => n + q, 0);
  const gift = applied?.key === "deal" && gifts.length ? gifts[giftIndex] : null;
  const usable = options.filter((o) => !o.blocked).length;

  return (
    <div
      className={cn(
        "relative mt-4 rounded-[1.5rem] border bg-card shadow-card",
        applied ? "border-success/40" : "border-dashed border-primary/50",
      )}
    >
      {/* Keyed on `celebrate`, so each newly applied offer replays them. */}
      {celebrate && (
        <span key={`glow-${celebrate}`} className="offer-glow pointer-events-none absolute inset-0 rounded-[1.5rem]" aria-hidden="true" />
      )}
      {celebrate && (
        <div key={`confetti-${celebrate}`} className="offer-celebration pointer-events-none motion-reduce:hidden absolute inset-0 overflow-hidden rounded-[1.5rem]">
          <ConfettiBurst />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="discount-options"
        className="relative flex w-full items-center gap-3.5 rounded-[1.5rem] px-5 py-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/80"
      >
        <IconTile key={`tile-${celebrate}`} className={cn(applied && "bg-success-soft text-success", celebrate && "offer-stamp")}>
          {applied && (applied.key === "deal" || applied.key === "biryani") ? (
            <Gift className="size-5" aria-hidden="true" />
          ) : (
            <BadgePercent className="size-5" aria-hidden="true" />
          )}
        </IconTile>
        <span className="min-w-0 flex-1" aria-live="polite">
          {applied ? (
            <>
              <span className="block font-semibold">
                {applied.title} <span className="text-success">applied</span>
              </span>
              <span key={`shine-${celebrate}`} className={cn("block text-sm font-semibold text-success", celebrate && "offer-shine")}>
                {gift
                  ? `Free ${giftName(gift)}`
                  : applied.saving > 0
                    ? `You save ${formatRupees(applied.saving)}`
                    : applied.detail}
              </span>
            </>
          ) : (
            <>
              <span className="block font-semibold">Offers</span>
              <span className="block text-sm text-muted-foreground">
                {hint ??
                  (usable === 0 ? "None for this bag yet" : usable === 1 ? "1 offer available" : `${usable} offers available`)}
              </span>
            </>
          )}
        </span>
        {celebrate && applied && (applied.saving > 0 || gift) && (
          <span
            key={`rise-${celebrate}`}
            className="offer-rise pointer-events-none motion-reduce:hidden absolute -top-3 right-12 rounded-full bg-success px-2.5 py-0.5 text-sm font-bold text-success-foreground shadow-card tabular-nums"
            aria-hidden="true"
          >
            {applied.saving > 0 ? `−${formatRupees(applied.saving)}` : "Free!"}
          </span>
        )}
        <ChevronDown
          className={cn("size-5 shrink-0 transition-transform duration-(--dur-base) ease-out-expo", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id="discount-options" className="relative border-t px-3 pt-3 pb-3">
          <div role="radiogroup" aria-label="Offer" className="space-y-2">
            {options.map((o) => (
              <OfferRow
                key={o.key}
                option={o}
                checked={selected === o.key}
                onCheck={() => onSelect(selected === o.key ? null : o.key)}
              />
            ))}
          </div>

          {applied?.key === "deal" && gifts.length > 1 && (
            <div className="mt-3 rounded-2xl bg-secondary px-4 py-3">
              <p className="flex items-center gap-2 font-semibold">
                <Gift className="size-5 shrink-0 text-primary" aria-hidden="true" />
                Pick your free gift
              </p>
              <div role="radiogroup" aria-label="Free gift" className="mt-2 space-y-1.5">
                {gifts.map((g, i) => (
                  <button
                    key={`${g.name}-${g.quantity}`}
                    type="button"
                    role="radio"
                    aria-checked={giftIndex === i}
                    onClick={() => onGift(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
                      giftIndex === i ? "border-primary" : "hover:border-ring/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                        giftIndex === i ? "surface-primary border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                      aria-hidden="true"
                    >
                      {giftIndex === i && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{giftName(g)}</span>
                    <span className="text-sm font-semibold text-success">Free</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {applied?.key === "biryani" && (
            <div className="mt-3 rounded-2xl bg-secondary px-4 py-3">
              <p className="flex items-center gap-2 font-semibold">
                <Gift className="size-5 shrink-0 text-primary" aria-hidden="true" />
                Pick {allowance === 1 ? "your free single biryani" : `${allowance} free single biryanis`}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
                {picked} of {allowance} picked
              </p>
              <ul className="mt-2 divide-y divide-border">
                {freeChoices.map((c) => {
                  const qty = picks[c.id] ?? 0;
                  const name = c.name;
                  return (
                    <li key={c.id} className="flex items-center gap-3 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug font-medium">{name}</span>
                        <span className="text-sm text-muted-foreground">
                          <s className="tabular-nums">{formatRupees(c.price)}</s>{" "}
                          <span className="font-semibold text-success">Free</span>
                        </span>
                      </span>
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => onPick(c.id, 1)}
                          disabled={picked >= allowance}
                          aria-label={`Pick ${name} free`}
                          className="h-9 shrink-0 rounded-full border bg-card px-4 text-sm font-semibold text-primary shadow-card outline-none hover:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/80 disabled:opacity-40"
                        >
                          Pick
                        </button>
                      ) : (
                        <div className="flex h-9 shrink-0 items-center gap-1 rounded-full border bg-card p-1 shadow-card">
                          <button
                            type="button"
                            onClick={() => onPick(c.id, qty - 1)}
                            aria-label={`One less free ${name}`}
                            className="flex size-7 items-center justify-center rounded-full bg-secondary outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-ring/80"
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                          <button
                            type="button"
                            onClick={() => onPick(c.id, qty + 1)}
                            disabled={picked >= allowance}
                            aria-label={`One more free ${name}`}
                            className="surface-primary flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring/80 disabled:opacity-40"
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="mt-3 px-2 text-sm text-muted-foreground">
            One offer per order. The best one is applied for you; tap another to switch.
          </p>
        </div>
      )}
    </div>
  );
}

function OfferRow({ option, checked, onCheck }: { option: OfferOption; checked: boolean; onCheck: () => void }) {
  const { title, detail, saving, blocked } = option;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={blocked !== null}
      onClick={onCheck}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/80 disabled:cursor-not-allowed",
        checked ? "border-primary bg-background" : "bg-background hover:border-ring/50",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          checked ? "surface-primary border-primary bg-primary text-primary-foreground" : "border-input",
        )}
        aria-hidden="true"
      >
        {checked && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-semibold", blocked && "text-muted-foreground")}>{title}</span>
        <span className="block text-sm text-muted-foreground">{blocked ?? detail}</span>
      </span>
      {!blocked && saving > 0 && (
        <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 text-sm font-semibold text-success tabular-nums">
          −{formatRupees(saving)}
        </span>
      )}
    </button>
  );
}
