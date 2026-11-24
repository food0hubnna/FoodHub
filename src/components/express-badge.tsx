import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/** An express kitchen's promise before ordering: "Express · delivery within 40 min". */
export function ExpressBadge({ minutes, className }: { minutes: number; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary ring-1 ring-primary/25",
        className,
      )}
    >
      <Zap className="size-3.5 fill-current" aria-hidden="true" />
      Express · delivery within {minutes}&nbsp;min
    </p>
  );
}
