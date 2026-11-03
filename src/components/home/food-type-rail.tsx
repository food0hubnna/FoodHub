import { Crown } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import { SectionTitle } from "@/components/handi/section-title";
import type { FoodType } from "@/lib/home-filters";
import { cn } from "@/lib/utils";

/**
 * "Hungry for?" — a row of little plates, one per food type, that bleeds to
 * the screen edges. Tapping one filters Home to that type; tapping it again
 * clears it. The chosen plate wears Handi's crown.
 */
export function FoodTypeRail({
  types,
  selected,
  onSelect,
}: {
  /** Only the types that have something to order right now. */
  types: FoodType[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  if (types.length === 0) return null;

  return (
    <section aria-labelledby="food-types-heading" className="mt-7">
      <SectionTitle id="food-types-heading">Hungry for?</SectionTitle>
      <ul className="-mx-6 mt-2 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {types.map((type, i) => {
          const isSelected = type.key === selected;
          return (
            <li key={type.key} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? null : type.key)}
                className="group flex w-20 flex-col items-center gap-1.5 rounded-2xl outline-none"
              >
                {/* A plate: cream rim, a thin gold line, the food in the middle. */}
                <span
                  className={cn(
                    "relative block size-20 rounded-full border bg-card p-1.5 shadow-card transition-transform duration-(--dur-base) ease-spring group-hover:-rotate-3 group-focus-visible:ring-3 group-focus-visible:ring-ring/80",
                    isSelected && "scale-105 border-amber",
                  )}
                >
                  {isSelected && (
                    <Crown
                      aria-hidden="true"
                      className="animate-pop-in absolute -top-2.5 left-1/2 z-10 size-5 -translate-x-1/2 -rotate-6 fill-amber text-primary"
                    />
                  )}
                  <span className="relative block size-full overflow-hidden rounded-full ring-1 ring-amber/70">
                    <BlurImage src={type.photo} alt="" sizes="72px" loading={i < 5 ? "eager" : undefined} className="object-cover" />
                  </span>
                </span>
                <span className={cn("text-center text-xs leading-tight font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                  {type.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
