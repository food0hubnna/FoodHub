import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { RandomAnimation } from "@/components/random-animation";
import { cn } from "@/lib/utils";

/**
 * Shared empty state. `art="handi"` for the big "you haven't started yet"
 * moments, like the empty cart and orders list; pass an `icon` instead for
 * small, in-place ones like a search with no results, where Handi would be
 * too loud.
 */
export function EmptyState({
  art,
  icon: Icon,
  title,
  children,
  action,
  compact = false,
}: {
  art?: "handi";
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-12" : "pt-12 pb-6")}>
      {art === "handi" && (
        <RandomAnimation set="empty" sizes="144px" className="animate-pop-in size-36 rounded-full bg-hero shadow-raised" />
      )}
      {Icon && (
        <span
          className="animate-pop-in flex size-16 items-center justify-center rounded-[1.25rem] bg-brand-soft text-brand-soft-foreground shadow-card"
          aria-hidden="true"
        >
          <Icon className="size-7" />
        </span>
      )}
      <p className={cn("font-heading font-bold", compact ? "mt-4 text-lg" : "mt-6 text-title")}>{title}</p>
      {children && <p className="mt-1.5 max-w-[20rem] text-muted-foreground">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
