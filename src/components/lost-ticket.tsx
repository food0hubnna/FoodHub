import type { ReactNode } from "react";
import { HandiSticker } from "@/components/handi/handi-says";

/**
 * The order page's token tag, reused as the art for the 404 and error pages: a
 * token nobody can collect, with Handi asleep on top of it.
 */
export function LostTicket({ label, token, note }: { label: string; token: string; note: ReactNode }) {
  return (
    <div className="relative w-full max-w-xs pt-16" aria-hidden="true">
      <HandiSticker pose="sleepy" sizes="112px" className="absolute! top-0 right-4 z-10 size-28" />
      <div className="paper surface-hero glow-hero relative -rotate-2 bg-hero p-5 pl-11 text-left text-hero-foreground">
        <span className="absolute top-1/2 left-4 size-4 -translate-y-1/2 rounded-full bg-background ring-2 ring-hero-accent/70" />
        <p className="text-label text-hero-accent">{label}</p>
        <p className="mt-1 font-heading text-6xl leading-none font-bold">{token}</p>
        <p className="mt-3 text-sm text-hero-foreground/85">{note}</p>
      </div>
    </div>
  );
}
