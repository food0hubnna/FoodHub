import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The little painted sprig beside every section title on the storybook screens. */
function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 18" aria-hidden="true" className={cn("h-4 w-6 shrink-0 text-success", className)}>
      <path d="M2 15C9 14 18 12 26 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13C7 9 9 6 12 5c1 4 0 7-4 8Z" fill="currentColor" />
      <path d="M15 11c0-4 2-7 6-8 1 4-1 7-6 8Z" fill="var(--amber)" />
      <path d="M11 13c3-1 6 0 8 3-4 1-7 0-8-3Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function SectionTitle({
  id,
  children,
  aside,
  className,
}: {
  id?: string;
  children: ReactNode;
  /** A small note on the right of the title. */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-3", className)}>
      <h2 id={id} className="flex items-center gap-1.5 min-w-0 font-display text-title font-bold">
        <Sprig />
        {children}
      </h2>
      {aside && <span className="shrink-0 pb-0.5 text-sm text-muted-foreground tabular-nums">{aside}</span>}
    </div>
  );
}
