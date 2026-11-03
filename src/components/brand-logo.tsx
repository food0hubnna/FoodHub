import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The round FoodHub logo on its own cream tile. The tile colour is fixed (not
 * a theme token) so the logo always brings its own ground, the same cream as
 * the app icons. Callers size and round it.
 */
export function BrandLogo({
  className,
  preload,
  splashTarget,
}: {
  className?: string;
  preload?: boolean;
  /** The startup splash lands on this tile. One per page, on its main brand spot (login, Home header). */
  splashTarget?: boolean;
}) {
  return (
    <div
      data-splash-target={splashTarget ? "" : undefined}
      className={cn(
        "flex size-36 items-center justify-center overflow-hidden rounded-[2rem] bg-[#f8f3e4] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.16),0_10px_28px_-10px_var(--glow-amber)]",
        className,
      )}
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
