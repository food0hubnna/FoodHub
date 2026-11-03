import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The name sign hung from an arched window on two gold cords. Sits right under the window. */
export function HangingSign({
  as: Tag = "p",
  children,
  className,
}: {
  as?: "p" | "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative z-10 -mt-3 flex flex-col items-center px-3 text-center">
      <span aria-hidden="true" className="absolute -top-2 left-1/2 flex w-32 -translate-x-1/2 justify-between">
        <span className="block h-4 w-0.5 rounded-full bg-amber" />
        <span className="block h-4 w-0.5 rounded-full bg-amber" />
      </span>
      <Tag
        className={cn(
          "surface-hero relative max-w-full rounded-xl bg-hero px-5 py-1.5 font-heading text-title leading-tight font-bold text-hero-foreground shadow-raised",
          className,
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
