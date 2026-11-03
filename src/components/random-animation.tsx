"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { pickClip, type AnimationSet, type Clip } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** The browser asks for less: no video, just the still. */
function wantsStill() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return saveData === true || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A random clip from one of Handi's animation sets (lib/animations.ts), silent
 * and looping, on top of its still; the video fades in once it's actually
 * playing and pauses while off screen. Decorative, and picked after mount so
 * the server and browser render the same thing. Callers size and shape it.
 */
export function RandomAnimation({
  set,
  sizes,
  className,
  mediaClassName,
}: {
  set: AnimationSet;
  sizes: string;
  className?: string;
  mediaClassName?: string;
}) {
  const [clip, setClip] = useState<Clip | null>(null);
  const [stillOnly, setStillOnly] = useState(true);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const first = setTimeout(() => {
      setClip(pickClip(set));
      setStillOnly(wantsStill());
    }, 0);
    return () => clearTimeout(first);
  }, [set]);

  const src = clip && !stillOnly ? clip.video : undefined;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div aria-hidden="true" className={cn("relative overflow-hidden", className)}>
      {clip && <Image src={clip.poster} alt="" fill sizes={sizes} className={cn("object-cover", mediaClassName)} />}
      {src && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-(--dur-base)",
            playing ? "opacity-100" : "opacity-0",
            mediaClassName,
          )}
        />
      )}
    </div>
  );
}
