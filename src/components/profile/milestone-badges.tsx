import type { CSSProperties } from "react";
import {
  Award,
  ChefHat,
  Compass,
  Crown,
  Lock,
  Repeat,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { SectionTitle } from "@/components/handi/section-title";
import { cn } from "@/lib/utils";

export type MilestoneKey =
  | "first_bite"
  | "regular"
  | "campus_explorer"
  | "campus_foodie"
  | "gate_legend"
  | "centurion";

type MilestoneStats = {
  /** Orders that actually reached the student (status = delivered). */
  deliveredCount: number;
  /** Distinct restaurants among those delivered orders. */
  restaurantsVisited: number;
  /** Restaurants on the platform right now — Campus Explorer needs all of them. */
  totalRestaurants: number;
};

/*
 * Every milestone is derived from counts that only ever go up (delivered
 * orders, distinct restaurants), so a badge never re-locks. The later
 * tiers exist so there's always something visibly locked to aim for —
 * with only three, most regulars had all of them within a couple of weeks.
 */
export const MILESTONES: {
  key: MilestoneKey;
  label: string;
  Icon: LucideIcon;
  /** [current, target] toward unlocking. */
  progress: (s: MilestoneStats) => [number, number];
  /** "19 more orders" etc., shown while locked. */
  remaining: (left: number) => string;
}[] = [
  {
    key: "first_bite",
    label: "First Bite",
    Icon: UtensilsCrossed,
    progress: (s) => [s.deliveredCount, 1],
    remaining: () => "Place your first order",
  },
  {
    key: "regular",
    label: "Regular",
    Icon: Repeat,
    progress: (s) => [s.deliveredCount, 10],
    remaining: (n) => `${n} more ${n === 1 ? "order" : "orders"}`,
  },
  {
    key: "campus_explorer",
    label: "Campus Explorer",
    Icon: Compass,
    progress: (s) => [s.restaurantsVisited, s.totalRestaurants],
    remaining: (n) => `${n} more ${n === 1 ? "restaurant" : "restaurants"}`,
  },
  {
    key: "campus_foodie",
    label: "Campus Foodie",
    Icon: ChefHat,
    progress: (s) => [s.deliveredCount, 25],
    remaining: (n) => `${n} more ${n === 1 ? "order" : "orders"}`,
  },
  {
    key: "gate_legend",
    label: "Gate Legend",
    Icon: Crown,
    progress: (s) => [s.deliveredCount, 50],
    remaining: (n) => `${n} more ${n === 1 ? "order" : "orders"}`,
  },
  {
    key: "centurion",
    label: "Centurion",
    Icon: Award,
    progress: (s) => [s.deliveredCount, 100],
    remaining: (n) => `${n} more ${n === 1 ? "order" : "orders"}`,
  },
];

function isUnlocked([current, target]: [number, number]) {
  return target > 0 && current >= target;
}

/** Shared unlock logic — used both to render the badges and (in profile/page.tsx) to detect a newly-unlocked one to celebrate. */
export function getUnlockedMilestones(
  deliveredCount: number,
  restaurantsVisited: number,
  totalRestaurants: number,
): MilestoneKey[] {
  const stats = { deliveredCount, restaurantsVisited, totalRestaurants };
  return MILESTONES.filter((m) => isUnlocked(m.progress(stats))).map((m) => m.key);
}

export function MilestoneBadges(stats: MilestoneStats) {
  const tiles = MILESTONES.map((m) => {
    const [current, target] = m.progress(stats);
    return { ...m, current, target, unlocked: isUnlocked([current, target]) };
  });
  const unlockedCount = tiles.filter((t) => t.unlocked).length;
  // The locked milestone you're proportionally closest to.
  const next = tiles
    .filter((t) => !t.unlocked && t.target > 0)
    .sort((a, b) => b.current / b.target - a.current / a.target)[0];

  return (
    <section className="mt-7" aria-labelledby="milestones">
      <SectionTitle id="milestones" aside={`${unlockedCount} of ${tiles.length}`}>
        Sticker book
      </SectionTitle>
      {next && (
        <p className="mt-0.5 text-sm text-muted-foreground">
          Next up: <span className="font-semibold text-foreground">{next.label}</span> —{" "}
          {next.remaining(Math.max(0, next.target - next.current)).toLowerCase()}
        </p>
      )}
      <ul className="paper mt-3 grid grid-cols-3 gap-x-1 gap-y-3 border bg-card p-3 shadow-card">
        {/* The tiles rise in one after another. */}
        {tiles.map((t, i) => (
          <li key={t.key} className={cn("animate-slide-up-in", t.unlocked && (i % 2 === 0 ? "-rotate-2" : "rotate-2"))} style={{ animationDelay: `${i * 50}ms` }}>
            <BadgeTile
              Icon={t.Icon}
              label={t.label}
              unlocked={t.unlocked}
              progress={t.target > 0 ? t.current / t.target : 0}
              caption={t.unlocked ? "Unlocked" : t.remaining(Math.max(0, t.target - t.current))}
              ringId={`ring-${t.key}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Ring geometry for the size-12 (48px) icon circle.
const RING_SIZE = 48;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function BadgeTile({
  Icon,
  label,
  unlocked,
  progress,
  caption,
  ringId,
}: {
  Icon: LucideIcon;
  label: string;
  unlocked: boolean;
  /** 0–1 fraction toward this milestone, drawn as a ring around a locked icon. */
  progress: number;
  caption: string;
  /** A unique id for the locked ring's gradient (one SVG gradient per tile). */
  ringId: string;
}) {
  const dashOffset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center px-1 py-1 text-center",
      )}
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center">
        {!unlocked && (
          <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--brand-1)" }} />
                <stop offset="55%" style={{ stopColor: "var(--brand-2)" }} />
                <stop offset="100%" style={{ stopColor: "var(--brand-3)" }} />
              </linearGradient>
            </defs>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              className="stroke-secondary"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              stroke={`url(#${ringId})`}
              className="ring-fill"
              style={{ "--ring-empty": RING_CIRCUMFERENCE } as CSSProperties}
            />
          </svg>
        )}
        <span
          className={cn(
            "relative flex items-center justify-center rounded-full",
            unlocked
              ? "surface-hero glow-hero animate-shine size-12 overflow-hidden bg-hero text-hero-accent"
              : "size-9 bg-secondary text-muted-foreground",
          )}
        >
          <Icon className={unlocked ? "size-5.5" : "size-4.5"} aria-hidden="true" />
        </span>
        {!unlocked && (
          <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border bg-card text-muted-foreground">
            <Lock className="size-2.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <span
        className={cn(
          "mt-2 text-xs leading-tight font-semibold",
          unlocked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span className={cn("mt-0.5 text-[0.6875rem] leading-tight", unlocked ? "text-success" : "text-muted-foreground")}>
        {unlocked ? (
          caption
        ) : (
          <>
            <span className="sr-only">Locked · </span>
            {caption}
          </>
        )}
      </span>
    </div>
  );
}
