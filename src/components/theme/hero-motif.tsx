import { HandiSticker } from "@/components/handi/handi-says";
import { cn } from "@/lib/utils";

/** Handi peeking onto a hero card. Decorative; position and size it with className. */
export function HeroMotif({ className }: { className?: string }) {
  return <HandiSticker pose="happy" sizes="160px" className={cn("absolute!", className)} />;
}
