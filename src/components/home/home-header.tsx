import { AboutFoodHubDialog } from "@/components/home/about-foodhub-dialog";
import { BrandLogo } from "@/components/brand-logo";
import { ChannelPopover } from "@/components/channel/channel-popover";
import { HandiSays } from "@/components/handi/handi-says";
import { AnimatedName } from "@/components/handi/animated-name";
import { Avatar, initialsOf } from "@/components/taste/avatar";
import { OpenTasteSheetButton } from "@/components/taste/taste-sheet";
import type { TimeOfDay } from "@/lib/date";
import { greeting } from "@/lib/handi/lines";

/**
 * Home's header: the logo (opens About), the WhatsApp group button
 * (ChannelPopover) and the student's avatar (opens "Your taste"), then Handi
 * greeting them by name in a speech bubble, with a line for the time of day.
 */
export function HomeHeader({
  fullName,
  timeOfDay,
  avatar,
}: {
  fullName: string;
  timeOfDay: TimeOfDay;
  /** The taste profile's avatar id, or null for the student's initials. */
  avatar: string | null;
}) {
  const { hello, name, line, pose } = greeting(fullName, timeOfDay);

  return (
    <header>
      <div className="flex items-center justify-between">
        <AboutFoodHubDialog>
          <BrandLogo splashTarget className="size-12" />
        </AboutFoodHubDialog>
        <div className="flex items-center gap-2.5">
          <ChannelPopover />
          <OpenTasteSheetButton
            aria-label="Your avatar and taste"
            className="pressable rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/80"
          >
            <Avatar id={avatar} initials={initialsOf(fullName)} className="glow-hero size-11 text-base ring-2 ring-card" />
          </OpenTasteSheetButton>
        </div>
      </div>
      <HandiSays pose={pose} preload className="mt-5">
        <h1 className="font-heading text-title leading-tight font-bold break-words">
          {hello}
          {name && (
            <>
              , <AnimatedName name={name} />
            </>
          )}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{line}</p>
      </HandiSays>
    </header>
  );
}
