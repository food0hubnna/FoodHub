// Everything Handi says, one place, by moment. Handi talks about the food and
// the promised time only: no line may imply the order is being tracked live.

import type { OrderStatus } from "@/lib/data/types";
import type { TimeOfDay } from "@/lib/date";

export type HandiPose = "wave" | "side" | "happy" | "joy" | "sleepy" | "excited";

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

const GREETINGS: Record<TimeOfDay, { hello: string; line: string; pose: HandiPose }> = {
  morning: { hello: "Good morning", line: "Fuel up for the day?", pose: "happy" },
  afternoon: { hello: "Good afternoon", line: "What are we craving now?", pose: "wave" },
  evening: { hello: "Good evening", line: "Dinner o'clock? The pot's warm.", pose: "joy" },
  night: { hello: "Still up", line: "Late night craving? Same.", pose: "sleepy" },
};

export function greeting(fullName: string, timeOfDay: TimeOfDay) {
  const { hello, line, pose } = GREETINGS[timeOfDay];
  return { hello, name: firstName(fullName), line, pose };
}

/** Under Handi's promise on the order page. */
export function orderLine(status: OrderStatus): string {
  if (status === "cancelled") return "This one won't reach you. If you have questions, call FoodHub.";
  if (status === "delivered") return "Hope it was worth the wait. Come back hungry!";
  return "I'll have it at Main Gate by then. We'll call you when we reach.";
}
