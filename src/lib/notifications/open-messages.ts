// "Ordering is open" push messages. Short enough for a lock
// screen, plain words, no emoji (the app's rule). Each has a fixed `id` —
// app_settings.recent_open_messages remembers the last few sent so the
// same one never comes twice in a row — so never renumber: add new ones
// with the next id, and delete by removing the line.
//
// Nothing about bodies or how much anyone eats, by decision.

export type OpenMessage = { id: number; title: string; body: string };

type Pool = "morning" | "lunch" | "evening" | "late" | "any";

const MESSAGES: Record<Pool, OpenMessage[]> = {
  // Before 11 AM
  morning: [
    { id: 1, title: "Kitchen's awake.", body: "And honestly? So should you be. Order now." },
    { id: 2, title: "Breakfast? Lunch? Brunch?", body: "We don't judge. FoodHub is open." },
    { id: 3, title: "Rise and dine", body: "Ordering's open. Your stomach's been waiting." },
    { id: 4, title: "Good morning to you only", body: "Order now, collect at Main Gate." },
    { id: 5, title: "Plot twist: food exists", body: "And it's coming to Main Gate. We're open." },
  ],
  // 11 AM – 3 PM
  lunch: [
    { id: 6, title: "Lunch o'clock", body: "Skip the mess queue. Order on FoodHub." },
    { id: 7, title: "Your stomach texted us", body: "It said “biryani, now”. We're open." },
    { id: 8, title: "Class ended. Hunger didn't.", body: "Ordering's open, order now." },
    { id: 9, title: "Mess menu? Not today.", body: "FoodHub is open for lunch." },
    { id: 10, title: "Main character lunch", body: "Pick your dish, we'll bring it to Main Gate." },
    { id: 11, title: "POV: you order biryani", body: "And it's at Main Gate before you know it." },
    { id: 13, title: "No thoughts, just biryani", body: "We're open. You know what to do." },
  ],
  // 3 PM – 7 PM
  evening: [
    { id: 14, title: "Snack attack incoming", body: "Biryani, combos, buckets. We're open." },
    { id: 15, title: "Evening cravings? Valid.", body: "FoodHub is taking orders." },
    { id: 16, title: "It's giving dinner plans", body: "Order now, pick up at Main Gate." },
    { id: 17, title: "Assignments can wait", body: "Food can't. We're open." },
    { id: 18, title: "Your sign to order", body: "This is it. Ordering's open." },
    { id: 19, title: "Hostel food is mid", body: "Upgrade tonight. We're open." },
    { id: 21, title: "We're open, bestie", body: "Free delivery to Main Gate. Cash or UPI." },
    { id: 22, title: "Fried rice fan club", body: "Meeting starts now. Order on FoodHub." },
  ],
  // After 7 PM
  late: [
    { id: 23, title: "Late-night menu: unlocked", body: "We're open. Go on." },
    { id: 24, title: "Still up? Same.", body: "Ordering's open for a bit." },
    { id: 25, title: "Midnight snack energy", body: "Starts now. Order on FoodHub." },
    { id: 26, title: "Studying hard?", body: "Your brain deserves a biryani. We're open." },
    { id: 27, title: "Night owl special", body: "Kitchen's open. Order now." },
  ],
  // Any time
  any: [
    { id: 28, title: "Doors open. Kitchen's hot.", body: "Order on FoodHub." },
    { id: 29, title: "Ordering is OPEN", body: "Not a drill. Go go go." },
    { id: 30, title: "Free delivery, no catch", body: "To Main Gate. Order now." },
    { id: 31, title: "Hungry? Say less.", body: "FoodHub is open." },
    { id: 32, title: "The wait is over", body: "Ordering's open. Treat yourself." },
    { id: 33, title: "Your cravings called", body: "We picked up. Order now." },
    { id: 34, title: "Biryani is calling", body: "Don't leave it on read. We're open." },
    { id: 36, title: "Food > everything", body: "Facts. Ordering's open." },
    { id: 38, title: "Not you scrolling hungry", body: "Fix that. We're open." },
    { id: 39, title: "Treat yourself era", body: "Starts now. Order on FoodHub." },
    { id: 40, title: "Ding ding, we're open", body: "Pay cash or UPI at Main Gate." },
  ],
};

/** Sent instead while 10% / 20% off is on. `{pct}` becomes "10%" or "20%". */
const OFFER_MESSAGES: OpenMessage[] = [
  { id: 101, title: "{pct} off. Yes, really.", body: "Ordering's open, grab it before it's gone." },
  { id: 102, title: "We're open + {pct} off", body: "Discount's on in your cart. Order now." },
  { id: 103, title: "Cheaper biryani hours", body: "{pct} off right now. We're open." },
  { id: 104, title: "Your wallet will thank you", body: "{pct} off today. Order on FoodHub." },
  { id: 105, title: "Sale? Sale.", body: "{pct} off while it lasts. We're open." },
];

/** How many recent message ids to avoid. */
export const RECENT_LIMIT = 10;

function istHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(now),
  );
}

/**
 * Picks one message for right now: the time of day's pool plus the
 * any-time ones. While an offer
 * is on (`offerPct` 20 beats 10), an offer message instead. Skips the
 * `recent` ids; if that leaves nothing, any of them will do.
 */
export function pickOpenMessage({
  now = new Date(),
  recent,
  offerPct,
}: {
  now?: Date;
  recent: number[];
  offerPct: 10 | 20 | null;
}): OpenMessage {
  let candidates: OpenMessage[];
  if (offerPct) {
    candidates = OFFER_MESSAGES.map((m) => ({
      ...m,
      title: m.title.replaceAll("{pct}", `${offerPct}%`),
      body: m.body.replaceAll("{pct}", `${offerPct}%`),
    }));
  } else {
    const hour = istHour(now);
    const time: Pool = hour < 11 ? "morning" : hour < 15 ? "lunch" : hour < 19 ? "evening" : "late";
    candidates = [...MESSAGES[time], ...MESSAGES.any];
  }
  const fresh = candidates.filter((m) => !recent.includes(m.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
