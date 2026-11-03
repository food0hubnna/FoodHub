import type { ReactNode } from "react";
import { HandiSticker } from "@/components/handi/handi-says";
import { ScriptName } from "@/components/theme/script-name";
import { Avatar } from "@/components/taste/avatar";
import { OpenTasteSheetButton } from "@/components/taste/taste-sheet";
import { cn } from "@/lib/utils";

/*
 * The top of the profile: the student's "Friend of Handi" card, an arched lit
 * window holding who they are. Their avatar in a gold ring with Handi beside
 * it, their name in handwriting, the weekly-rank pill, and three stats on
 * plates. The no-show count turns hero-danger once it isn't zero, since that's
 * the stat the ban system actually cares about.
 */
export function MemberCard({
  initials,
  avatar,
  name,
  memberSince,
  rankBadge,
  cravingsSolved,
  streakDays,
  noShows,
}: {
  initials: string;
  /** The taste profile's avatar id, or null for the initials. */
  avatar: string | null;
  name: string;
  memberSince: string;
  /** <WeeklyRankBadge/>, which renders nothing when it has nothing flattering to say. */
  rankBadge: ReactNode;
  cravingsSolved: number;
  streakDays: number;
  noShows: number;
}) {
  return (
    <section className="arch-card surface-hero glow-hero relative flex flex-col items-center bg-hero px-5 pt-7 pb-5 text-center text-hero-foreground">
      <p className="text-label text-hero-accent">Friend of Handi</p>
      <div className="relative mt-3">
        {/* Tapping the avatar opens "Your taste" (the page hosts the sheet). */}
        <OpenTasteSheetButton
          aria-label="Your avatar and taste"
          className="pressable block size-24 rounded-full bg-hero-accent p-[3px] outline-none focus-visible:ring-3 focus-visible:ring-hero-foreground"
        >
          <Avatar id={avatar} initials={initials} tone="pass" className="size-full text-3xl ring-2 ring-hero" />
        </OpenTasteSheetButton>
        <HandiSticker pose="wave" sizes="64px" className="absolute! -right-11 -bottom-1 size-16" />
      </div>
      <h1 className="mt-3 max-w-full font-heading text-3xl leading-tight break-words">
        <ScriptName text={name} tone="hero" className="block leading-[1.15]" />
      </h1>
      <p className="mt-0.5 text-sm text-hero-foreground/85">Friends since {memberSince}</p>
      <div className="mt-3 empty:hidden">{rankBadge}</div>

      <dl className="mt-5 grid w-full grid-cols-3 gap-2">
        <Stat value={cravingsSolved} label={cravingsSolved === 1 ? "craving solved" : "cravings solved"} />
        <Stat value={streakDays} label="day streak" />
        <Stat value={noShows} label={noShows === 1 ? "no-show" : "no-shows"} danger={noShows > 0} />
      </dl>
    </section>
  );
}

function Stat({ value, label, danger = false }: { value: number; label: string; danger?: boolean }) {
  return (
    <div className="flex flex-col-reverse items-center justify-end gap-1.5">
      <dt className="text-xs leading-tight text-hero-foreground">{label}</dt>
      <dd
        className={cn(
          "flex size-16 items-center justify-center rounded-full bg-hero-foreground/10 font-heading text-2xl font-bold tabular-nums ring-1 ring-hero-accent/60",
          danger && "text-hero-danger",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
