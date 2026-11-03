import { cn } from "@/lib/utils";

/** A small animated detail for the campus pass's top-right corner. Decorative. */
export function PassArt({ className }: { className?: string }) {
  return (
    <>
      <PinePassArt className={className} />
    </>
  );
}

function PinePassArt({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("only-pine pointer-events-none absolute size-12", className)}>
      <span className="absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,var(--promo-light),transparent)]" />
      <svg viewBox="0 0 48 48" className="relative size-full overflow-visible text-hero-foreground/75">
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path className="pass-steam" d="M20 24c-3-3 3-5 0-9" />
          <path className="pass-steam [animation-delay:0.25s]" d="M28 24c-3-3 3-5 0-9" />
        </g>
        <g className="pass-lid">
          <circle cx="24" cy="18.5" r="2.4" fill="currentColor" />
          <path d="M10 34c0-8.5 6.3-14 14-14s14 5.5 14 14z" fill="currentColor" />
          <path d="M15 30c.6-3.4 2.8-6 5.8-7" stroke="white" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
        <path d="M6 35h36c-1 4-7 6-18 6s-17-2-18-6z" fill="currentColor" opacity="0.9" />
        <path className="motif-twinkle" d="M41 10l1.3 3.2 3.2 1.3-3.2 1.3L41 19l-1.3-3.2-3.2-1.3 3.2-1.3z" fill="currentColor" />
      </svg>
    </span>
  );
}

