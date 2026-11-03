import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The round FoodHub logo, transparent around the badge so it sits directly on
 * whatever is behind it. Callers size it.
 */
export function BrandLogo({
  className,
  preload,
  splashTarget,
}: {
  className?: string;
  preload?: boolean;
  /** The startup splash lands on this logo. One per page, on its main brand spot (login, Home header). */
  splashTarget?: boolean;
}) {
  return (
    <div
      data-splash-target={splashTarget ? "" : undefined}
      className={cn("flex size-36 items-center justify-center overflow-hidden rounded-full", className)}
    >
      <Image
        src="/brand/mark.webp"
        alt="FoodHub — For the campus cravings"
        width={512}
        height={512}
        sizes="144px"
        preload={preload}
        className="size-full object-contain"
      />
    </div>
  );
}
