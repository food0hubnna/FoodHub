import { getTimeOfDayIST } from "@/lib/date";

// Handi's animations, one set per screen. A screen shows a random clip from
// its set each time it opens. Adding a clip is one line here plus its files in
// public/animations; `poster` also stands in for the video under reduced
// motion or data saver, and a clip with no `video` is just that still.

export type Clip = {
  poster: string;
  video?: string;
  /** Which part of the day it's painted for; banner scenes only. Absent means any time. */
  time?: "day" | "evening";
};

export const ANIMATIONS = {
  banner: [
    { poster: "/animations/b01.webp", video: "/animations/b01.mp4", time: "evening" },
    { poster: "/animations/b02.webp", video: "/animations/b02.mp4", time: "day" },
  ],
  order: [{ poster: "/animations/o01.webp", video: "/animations/o01.mp4" }],
  delivered: [
    { poster: "/animations/d01.webp" },
    { poster: "/animations/d02.webp" },
    { poster: "/animations/d03.webp" },
    { poster: "/animations/d04.webp" },
    { poster: "/animations/d05.webp" },
  ],
  closed: [{ poster: "/animations/c01.webp" }, { poster: "/animations/c02.webp" }],
  empty: [{ poster: "/animations/e01.webp" }, { poster: "/animations/e02.webp" }],
} satisfies Record<string, Clip[]>;

export type AnimationSet = keyof typeof ANIMATIONS;

/** A random clip from the set, so a moonlit scene never shows at noon. */
export function pickClip(set: AnimationSet, now: Date = new Date()): Clip {
  const clips: Clip[] = ANIMATIONS[set];
  const timeOfDay = getTimeOfDayIST(now);
  const part = timeOfDay === "morning" || timeOfDay === "afternoon" ? "day" : "evening";
  const fitting = clips.filter((clip) => !clip.time || clip.time === part);
  const pool = fitting.length > 0 ? fitting : clips;
  return pool[Math.floor(Math.random() * pool.length)];
}
