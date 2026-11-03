import type { CSSProperties } from "react";

/** The student's name in gold: the letters rise in, then hop in a little wave now and then (.name-letter in globals.css). */
export function AnimatedName({ name }: { name: string }) {
  return (
    <span className="text-primary">
      <span className="sr-only">{name}</span>
      <span aria-hidden="true" className="inline-block whitespace-nowrap">
        {[...name].map((letter, i) => (
          <span key={i} className="name-letter" style={{ "--i": i } as CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
