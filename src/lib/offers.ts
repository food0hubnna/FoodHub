// Discount offers the admin switches on from the dashboard
// (app_settings.offer_pct10 / offer_pct20 / offer_biryani). 10% / 20% are
// for every restaurant except the ones the admin switched off for that
// offer (offer_restaurant_exclusions); the biryani offer is for
// ONE restaurant (app_settings.offers_restaurant_id, by
// decision). A student picks at most one per order in the cart.
// public.place_order() is the real rule (it re-checks the offer is on, the
// restaurant and that the order qualifies, and computes the discount
// itself); this file mirrors it so the cart can show the numbers before the
// order is placed — change the two together.
//
// Full and single biryanis are decided by MENU SECTION (the kitchen names
// them "Chicken Fry Biryani" / "Single Fry Biryani", not "(Full)" /
// "(Single)"), the same section names place_order() checks. The server
// sends the matching dish ids (getOffers()), so the cart never guesses.

export type OfferKey = "pct5" | "pct10" | "pct20" | "biryani";

export const OFFER_KEYS: OfferKey[] = ["pct5", "pct10", "pct20", "biryani"];

/** The offers with a per-restaurant switch (the rest: offers_restaurant_id only). */
export type PercentOfferKey = "pct5" | "pct10" | "pct20";
export const PERCENT_OFFER_KEYS: PercentOfferKey[] = ["pct5", "pct10", "pct20"];

/** Sections whose dishes count as a full biryani / can be the free single. Same names as place_order(). */
export const FULL_BIRYANI_SECTIONS = ["Veg Biryani", "Non-Veg Biryani"];
export const SINGLE_BIRYANI_SECTION = "Single Biryani";

/** An order's offer: one of the admin's offers above, or the kitchen's own deal. */
export type OrderOfferKey = OfferKey | "deal";

export const OFFERS: Record<OrderOfferKey, { title: string; short: string; detail: string }> = {
  pct5: { title: "5% off", short: "5% off", detail: "On your whole order" },
  pct10: { title: "10% off", short: "10% off", detail: "On your whole order" },
  pct20: { title: "20% off", short: "20% off", detail: "On your whole order" },
  biryani: {
    title: "Buy 3 full biryanis, get 1 single free",
    short: "Free single biryani",
    detail: "Pick any single biryani for every 3 full ones",
  },
  deal: { title: "Kitchen deal", short: "Kitchen deal", detail: "Applied by itself when your bag qualifies" },
};

/** One step of a kitchen deal: free gifts to pick from, or rupees off. */
export type DealTier = {
  min: number;
  label: string;
  off?: number;
  gifts?: { name: string; quantity: number }[];
};

/** A kitchen's own deal (public.kitchen_deals), while the admin has it on. */
export type KitchenDeal = {
  restaurantId: string;
  title: string;
  unit: string;
  units: string;
  /** Repeat money tiers as often as they fit (11 + 5 + 5 ...). */
  repeat: boolean;
  tiers: DealTier[];
  /** The dishes it counts (the section, or one dish in it), from the server. */
  dishIds: string[];
};

/** What a cart earns from a kitchen deal right now. */
export type DealResult = {
  count: number;
  /** Rupees off (money deals). */
  off: number;
  /** The gift tier reached (gift deals), or null. */
  giftTier: DealTier | null;
  /** The next step up: how many more to add and what it gives, or null at the top. */
  next: { more: number; tier: DealTier } | null;
};

/** The same rule as place_order(): gifts = the highest tier once; money + repeat = greedy. */
export function dealResult(deal: KitchenDeal, lines: { dishId: string; quantity: number }[]): DealResult {
  const count = lines.reduce((n, l) => n + (deal.dishIds.includes(l.dishId) ? l.quantity : 0), 0);
  const tiers = [...deal.tiers].sort((a, b) => a.min - b.min);
  const above = tiers.find((t) => t.min > count) ?? null;
  const next = above ? { more: above.min - count, tier: above } : null;
  if (deal.repeat) {
    let left = count;
    let off = 0;
    for (const t of [...tiers].reverse()) {
      off += Math.floor(left / t.min) * (t.off ?? 0);
      left %= t.min;
    }
    return { count, off, giftTier: null, next };
  }
  const reached = [...tiers].reverse().find((t) => t.min <= count) ?? null;
  if (!reached) return { count, off: 0, giftTier: null, next };
  if (reached.gifts?.length) return { count, off: 0, giftTier: reached, next };
  return { count, off: reached.off ?? 0, giftTier: null, next };
}

/** What a step gives, short: "₹50 off" / "a free Thums Up (1 L)" / "a free gift". */
export function formatDealReward(tier: DealTier): string {
  if (tier.gifts?.length) return tier.gifts.length === 1 ? `a free ${tier.gifts[0].name}` : "a free gift";
  return `₹${tier.off ?? 0} off`;
}

/** "2 × Mini Dum Biryani" / "Chicken Starter". */
export function giftName(g: { name: string; quantity: number }): string {
  return g.quantity > 1 ? `${g.quantity} × ${g.name}` : g.name;
}

/** How many paid full biryanis earn one free single. */
export const FULLS_PER_FREE = 3;

/** A single biryani a student can pick for free. */
export type FreeChoice = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
};

/** What the cart and order pages get from the server. */
export type OffersState = {
  active: OfferKey[];
  /** Restaurants the admin switched off for 10% / 20% (every other one gets it). */
  excluded: Record<PercentOfferKey, string[]>;
  /** The one restaurant the biryani offer applies to, or null if none is set. */
  restaurantId: string | null;
  restaurantName: string;
  /** Dish ids of that restaurant's full biryanis (FULL_BIRYANI_SECTIONS). */
  fullDishIds: string[];
  /** Its single biryanis (SINGLE_BIRYANI_SECTION), while the biryani offer is on. */
  freeChoices: FreeChoice[];
  /** Kitchen deals the admin has on. */
  deals: KitchenDeal[];
};

export const NO_OFFERS: OffersState = {
  active: [],
  excluded: { pct5: [], pct10: [], pct20: [] },
  restaurantId: null,
  restaurantName: "",
  fullDishIds: [],
  freeChoices: [],
  deals: [],
};

export function isOfferKey(value: unknown): value is OfferKey {
  return typeof value === "string" && (OFFER_KEYS as string[]).includes(value);
}

export function isPercentOfferKey(value: unknown): value is PercentOfferKey {
  return typeof value === "string" && (PERCENT_OFFER_KEYS as string[]).includes(value);
}

/** Whether an offer can be used on an order from this restaurant (the same rule as place_order()). */
export function offerAppliesTo(offers: OffersState, key: OfferKey, restaurantId: string | null): boolean {
  if (!restaurantId) return false;
  if (key === "biryani") return offers.restaurantId === restaurantId;
  return !offers.excluded[key].includes(restaurantId);
}

function fullCount(lines: { dishId: string; quantity: number }[], fullDishIds: string[]): number {
  return lines.reduce((n, l) => n + (fullDishIds.includes(l.dishId) ? l.quantity : 0), 0);
}

/** Free singles the cart has earned: one per 3 paid full biryanis. */
export function freeAllowance(lines: { dishId: string; quantity: number }[], fullDishIds: string[]): number {
  return Math.floor(fullCount(lines, fullDishIds) / FULLS_PER_FREE);
}

/** Full biryanis still needed for the next free single. */
export function fullsToNextFree(lines: { dishId: string; quantity: number }[], fullDishIds: string[]): number {
  return FULLS_PER_FREE - (fullCount(lines, fullDishIds) % FULLS_PER_FREE);
}

/** The discount in rupees, rounded like place_order() (Postgres round(): half away from zero). */
export function discountAmount(
  offer: OfferKey | null,
  itemsTotal: number,
  freeItems: { price: number; quantity: number }[] = [],
): number {
  if (offer === "pct5") return Math.round(itemsTotal * 0.05);
  if (offer === "pct10") return Math.round(itemsTotal * 0.1);
  if (offer === "pct20") return Math.round(itemsTotal * 0.2);
  if (offer === "biryani") return freeItems.reduce((n, f) => n + f.price * f.quantity, 0);
  return 0;
}
