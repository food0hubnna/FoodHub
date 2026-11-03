import type { ReactNode } from "react";
import Image from "next/image";
import type { HandiPose } from "@/lib/handi/lines";
import { cn } from "@/lib/utils";

/** One of Handi's cut-out poses (public/handi, built by scripts/build-handi-stickers.mjs). Decorative. */
export function HandiSticker({
  pose,
  sizes = "96px",
  className,
  preload,
}: {
  pose: HandiPose;
  sizes?: string;
  className?: string;
  preload?: boolean;
}) {
  return (
    <span aria-hidden="true" className={cn("relative block size-24 shrink-0", className)}>
      <Image src={`/handi/${pose}.webp`} alt="" fill unoptimized sizes={sizes} preload={preload} className="object-contain" />
    </span>
  );
}

/** Handi with a speech bubble beside it. What goes in the bubble is the caller's. */
export function HandiSays({
  pose,
  children,
  preload,
  className,
}: {
  pose: HandiPose;
  children: ReactNode;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <HandiSticker pose={pose} preload={preload} className="animate-pop-in" />
      <div className="animate-slide-up-in paper relative min-w-0 flex-1 border bg-card px-4 py-3 shadow-card">
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rotate-45 border-b border-l bg-card"
        />
        {children}
      </div>
    </div>
  );
}
